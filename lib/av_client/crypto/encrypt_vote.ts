import Bignum from "./bignum";
import Point from "./point";
import {
  addPoints,
  bignumFromHex,
  bignumToHex,
  Curve,
  generateRandomBignum,
  hashToBignum,
  pointFromHex,
  pointFromX,
  pointToHex,
  
  isValidHexString
} from "./util";

import { voteToPoint } from "./vote_converter";

import * as crypto from "../aion_crypto";

export const encryptVote = (encoding_type, vote, encryption_key_string: string) => {
  let vote_point = voteToPoint(encoding_type, vote)
  return encryptVotePoint(vote_point, encryption_key_string)
}

function encryptVotePoint(vote_point, encryption_key_string: string) {
  let encryption_key = pointFromHex(encryption_key_string).toEccPoint();
  let randomness_bn = crypto.randomBN();
  let vote_cryptogram = crypto.ElGamalPointCryptogram.encrypt(vote_point, encryption_key, randomness_bn);

  return {
    cryptogram: vote_cryptogram.toString(),
    randomness: bignumToHex(randomness_bn)
  }
}
