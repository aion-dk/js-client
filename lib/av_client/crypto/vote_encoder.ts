import * as sjcl from '../sjcl';
import * as crypto from "../aion_crypto";

const ADJUSTING_BYTE_COUNT = 1

/**
 * @param {bytes} the bytes to be encoded as points.
 * @return {array of sjcl.ecc.point} An array of points representing encoding the bytes
 */
export const bytesToPoints = (bytes: Uint8Array): any[] => {
    const pointContentSize = computePointContentSize()
    const pointCount = Math.ceil(bytes.length / pointContentSize)

    // pad the byte array with 0x00 on the right side
    const paddedBytes = padBytes(pointCount * pointContentSize, bytes)

    // compute the `bn` used to increment the adjusting byte
    const incrementer = computeIncrementer()

    const points: any[] = []
    for (let i=0; i<pointCount; i++) {
        const offset = i * pointContentSize
        const bytesPartial = paddedBytes.slice(offset, offset + pointContentSize)
        const byteArray = Array.from(bytesPartial)
        points.push(bytesToPoint(byteArray, incrementer))
    }

    return points
}

/**
 * @param {points} the array of sjcl.ec.point to be decoded into bytes.
 * @param {byteCount} the amount of bytes to be returned. This is calculated as the largest size a vote could have.
 * @return {Uint8Array} The array of bytes
 */
export const pointsToBytes = (points: any[], byteCount: number): Uint8Array => {
    const pointContentSize = computePointContentSize()
    if (points.length * pointContentSize < byteCount)
        throw new Error("Too many bytes to be decoded from points");

    const bytes = points
        .map((point) => pointToBytes(point, pointContentSize))
        .flat()

    const contentBytes = bytes.slice(0, byteCount)
    const paddingBytes = bytes.slice(byteCount)
    if (paddingBytes.some((byte) => byte != 0))
        throw new Error("Invalid encoding of points");

    return Uint8Array.from(contentBytes)
}

const bytesToPoint = (bytes: number[], incrementer: any): any => {
    // turn bytes into bignum (used as x coordinate of the point) by:
    // [adjusting bytes] + [0x00 padding bytes] + [bytes]
    // padding doesn't happen in case `bytes` is of exact size
    // the amount of adjusting bytes is configurable by setting `ADJUSTING_BYTE_COUNT`
    // construct the point encoding:
    // [0x02 encoding flag byte] + [x coordinate bytes]
    // try to decode the point. If invalid, increment the adjusting bytes and retry
    // the adjusting bytes are incremented by adding x = x + incrementer

    // FIXME: This function is ready for supporting multiple elliptic curves but it
    // FIXME: depends on `crypto.pointFromBits()` which is currently hardcoded to work
    // FIXME: with 32 byte length curves.

    const flagBits = sjcl.codec.bytes.toBits([2])
    const fieldBitLength = crypto.Curve.field.modulus.bitLength()
    let x = sjcl.bn.fromBits(sjcl.codec.bytes.toBits(bytes))

    while (!x.greaterEquals(crypto.Curve.field.modulus)) {
        try {
            const xBits = x.toBits(fieldBitLength)
            const pointBits = sjcl.bitArray.concat(flagBits, xBits)
            const point = crypto.pointFromBits(pointBits)

            return point
        } catch (err) {
            // increment
            x = x.add(incrementer)
        }
    }

    throw new Error("point encoding adjusting bytes exhausted")
}

const pointToBytes = (point: any, contentSize: number): number[]  => {
    // parse the x coordinate of the point as:
    // [adjusting bytes] + [`contentSize` bytes]

    if (point.isIdentity)
        throw new Error("identity point is not a valid point encoding")

    const xBits = point.x.toBits()
    const offset = sjcl.bitArray.bitLength(xBits) - (contentSize * 8)
    const contentBits = sjcl.bitArray.bitSlice(xBits, offset)

    return sjcl.codec.bytes.fromBits(contentBits)
}

const padBytes = (size: number, bytes: Uint8Array): Uint8Array => {
    const paddedBytes = new Uint8Array(size)
    paddedBytes.fill(0)
    paddedBytes.set(bytes, 0)                                   // pad on the right
    // paddedBytes.set(bytes, paddedBytes.length - bytes.length)   // pad on the left

    return paddedBytes
}

const computeIncrementer = (): any => {
    const pointSize = Math.floor(crypto.Curve.field.prototype.exponent / 8)
    const incrementerSize = pointSize - ADJUSTING_BYTE_COUNT + 1

    // Fill the byte array with 0x00 and set the left most byte to 0x01
    const incrementerBytes = new Uint8Array(incrementerSize)
    incrementerBytes.set([1])

    return sjcl.bn.fromBits(sjcl.codec.bytes.toBits(incrementerBytes))
}

const computePointContentSize = (): number => {
    const pointSize = Math.floor(crypto.Curve.field.prototype.exponent / 8)
    const pointContentSize = pointSize - ADJUSTING_BYTE_COUNT

    return pointContentSize
}
