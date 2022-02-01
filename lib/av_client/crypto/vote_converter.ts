import * as sjcl from '../sjcl';
import * as crypto from "../aion_crypto";
import { MarkingType } from "../types";

// encoding vote methods
const VOTE_ENCODING_TYPE = Object.freeze({
  "INVALID" : -1,
  "BLANK" : 0,      // 0x00

  // 0x01 - 0x0f text encoding types
  "TEXT_UTF8" : 1,  // 0x01 - text encoded as UTF8 format

  // 0x11 - 0x1f list of integers encoding types
  "LIST_1B" : 17,   // 0x11 - each integer encoded as 1 byte
  "LIST_2B" : 18,   // 0x12 - each integer encoded as 2 bytes

  // 0x21 - 0x2f ranked list of integers encoding types
  "RANKED_1B" : 33, // 0x21 - each integer encoded as 1 byte
  "RANKED_2B" : 34  // 0x22 - each integer encoded as 2 bytes

  // 0xf0 - 0xff must not be used to ensure that x coordinate of point P is less than the prime of the curve
})

const getEncodingTypeFromMarkingType = (markingType: MarkingType) => {
  const { minMarks, maxMarks } = markingType;

  if(markingType.style === "regular" &&
    minMarks === 1 &&
    maxMarks === 1) {
    return VOTE_ENCODING_TYPE.TEXT_UTF8
  }

  throw new Error("Marking type not supported");
}

/**
 * @param {encodingType} integer representing the encoding type (available encoding type at VOTE_ENCODING_TYPE)
 * @param {vote} the vote to be encoded as a point, either a string or and array of ids.
 * @return {sjcl.ecc.point} The point representing the vote
 */
 export const voteToPoint = (markingType: MarkingType, vote) => {
  // turn vote into bignum (used as x coordinate of the point) by:
  // [encoding type bits] + [padding bits] + [vote bits] + [0x00 bits] (last byte is the
  // adjusting byte)
  // prepend the flag bits and try to decode point
  // if not on the curve, increment the x bignum and retry

  const encodingType = getEncodingTypeFromMarkingType(markingType);

  if (encodingType == VOTE_ENCODING_TYPE.BLANK) {
    return new sjcl.ecc.point(crypto.Curve)
  }

  let voteBN

  switch (encodingType) {
    case VOTE_ENCODING_TYPE.TEXT_UTF8: {
      // the vote is a text
      if (typeof vote !== 'string') {
        throw new sjcl.exception.invalid("vote is not a string")
      }
      if (vote == '') {
        throw new sjcl.exception.invalid("vote cannot be empty")
      }

      const voteBits = sjcl.codec.utf8String.toBits(vote)

      if (sjcl.bitArray.bitLength(voteBits) > 30 * 8) {
        throw new sjcl.exception.invalid("vote text is too long")
      }

      voteBN = sjcl.bn.fromBits(voteBits)
      break
    }
    case VOTE_ENCODING_TYPE.LIST_1B:
    case VOTE_ENCODING_TYPE.RANKED_1B:
      // the vote is an array of ids
      if (!(Array.isArray(vote))) {
        throw new sjcl.exception.invalid("vote is not an array")
      }
      if (vote.length == 0) {
        throw new sjcl.exception.invalid("vote cannot be empty")
      }
      if (vote.some(id => id < 1 || id > 256 - 1)) {
        throw new sjcl.exception.invalid("vote array value is out of bound")
      }
      if (vote.length > 30) {
        throw new sjcl.exception.invalid("vote array is too long")
      }

      voteBN = new sjcl.bn(0)
      vote.forEach(v => {
        voteBN = voteBN.mul(256)
        voteBN = voteBN.add(v)
      })
      break
    case VOTE_ENCODING_TYPE.LIST_2B:
    case VOTE_ENCODING_TYPE.RANKED_2B:
      // the vote is an array of ids
      if (!(Array.isArray(vote))) {
        throw new sjcl.exception.invalid("vote is not an array")
      }
      if (vote.length == 0) {
        throw new sjcl.exception.invalid("vote cannot be empty")
      }
      if (vote.some(id => id < 1 || id > 256 ** 2 - 1)) {
        throw new sjcl.exception.invalid("vote array value is out of bound")
      }
      if (vote.length > 15) {
        throw new sjcl.exception.invalid("vote array is too long")
      }

      voteBN = new sjcl.bn(0)
      vote.forEach(v => {
        voteBN = voteBN.mul(256 ** 2)
        voteBN = voteBN.add(v)
      })
      break
    default:
      throw new sjcl.exception.invalid("vote encoding not supported")
  }

  // Set the 33rd byte to 02 or 03
  const flag = Math.floor(Math.random() * 2) + 2  // 2 or 3
  let flagBN = new sjcl.bn(flag)
  flagBN = flagBN.mul(new sjcl.bn(256).power(32))

  // Set the 32nd byte according to the vote encoding type
  const encodingBN = new sjcl.bn(encodingType).mul(new sjcl.bn(256).power(31))

  // Set the right most byte to 00 as the adjusting byte
  voteBN = voteBN.mul(256)
  // Construct the point encoding
  const pointBN = voteBN.add(encodingBN).add(flagBN)

  let point
  let found = false
  let tries = 0
  while (!found && tries < 256) {
    tries++

    try {
      point = crypto.pointFromBits(pointBN.toBits())
      found = true
    } catch (err) {
      // increment
      pointBN.addM(1)
    }
  }

  if (!found) {
    throw new sjcl.exception.invalid("mapping vote to point failed")
  }

  return point
}

/**
 * @param {pointString} The point representing the vote, encoded as a string
 * @return {encodingType; vote} An object containing the encoding type (from VOTE_ENCODING_TYPE) and the vote (a string
 * or an array of ids)
 */
 export const pointToVote = (pointString) => {
  let point = crypto.pointFromBits(sjcl.codec.hex.toBits(pointString))

  if (point.isIdentity){
    return {
      encodingType: VOTE_ENCODING_TYPE.BLANK,
      vote: null
    }
  }

  let vote

  const xBits = point.x.toBits()
  const encodingType = sjcl.bitArray.extract(xBits, 0, 8)
  const voteBits = sjcl.bitArray.bitSlice(xBits, 8 * 1, 8 * 31)
  let voteBN = sjcl.bn.fromBits(voteBits).trim()

  switch (encodingType) {
    case VOTE_ENCODING_TYPE.TEXT_UTF8:
      // vote is encoded as text

      // in case voteBN is zero (0), sjcl encoding outputs '0x000000'
      // therefore, the case need to be handled differently
      if (voteBN.equals(0)) {
        vote = ''
      } else {
        vote = sjcl.codec.utf8String.fromBits(voteBN.toBits())
      }
      break
    case VOTE_ENCODING_TYPE.LIST_1B:
    case VOTE_ENCODING_TYPE.RANKED_1B:
      // vote is encoded as array of ids

      // in case voteBN is zero (0), sjcl encoding outputs '0x000000'
      // therefore, the case need to be handled differently
      if (voteBN.equals(0)) {
        vote = []
      } else {
        const voteHex = sjcl.codec.hex.fromBits(voteBN.toBits())
        vote = voteHex.match(/.{2}/g).map(s => parseInt(s, 16))
      }
      break
    case VOTE_ENCODING_TYPE.LIST_2B:
    case VOTE_ENCODING_TYPE.RANKED_2B:
      // vote is encoded as array of ids

      // in case voteBN is zero (0), sjcl encoding outputs '0x000000'
      // therefore, the case need to be handled differently
      if (voteBN.equals(0)) {
        vote = []
      } else {
        let voteHex = sjcl.codec.hex.fromBits(voteBN.toBits())

        // Prepend '00' in case the first integer takes only 1 byte space
        if(voteHex.length % 4 != 0) {
          voteHex = '00' + voteHex
        }

        vote = voteHex.match(/.{4}/g).map(s => parseInt(s, 16))
      }
      break
    default:
      throw new sjcl.exception.corrupt("point does not have a valid vote encoding")
  }

  return {
    encodingType: encodingType,
    vote: vote
  }
}

export {};
