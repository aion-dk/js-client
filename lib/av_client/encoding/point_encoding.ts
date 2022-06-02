import * as sjcl from '../sjcl';
import * as crypto from "../aion_crypto";

const ADJUSTING_BYTE_COUNT = 1
const INCREMENTER = computeIncrementer()
const POINT_CONTENT_SIZE = computePointContentSize()

/**
 * @param {bytes} the bytes to be encoded as points.
 * @return {array of sjcl.ecc.point} An array of points representing encoding the bytes
 */
export const bytesToPoints = (bytes: Uint8Array): any[] => {
    const pointCount = Math.ceil(bytes.length / POINT_CONTENT_SIZE)

    // pad the byte array with 0x00 on the right side
    const paddedBytes = padBytesRight(bytes, pointCount * POINT_CONTENT_SIZE)

    const points: any[] = []
    for (let i=0; i<pointCount; i++) {
        const offset = i * POINT_CONTENT_SIZE
        const bytesPartial = paddedBytes.slice(offset, offset + POINT_CONTENT_SIZE)
        const byteArray = Array.from(bytesPartial)
        points.push(bytesToPoint(byteArray))
    }

    return points
}

/**
 * @param {points} the array of sjcl.ec.point to be decoded into bytes.
 * @param {byteCount} the amount of bytes to be returned. This is calculated as the largest size a vote could have.
 * @return {Uint8Array} The array of bytes
 */
export const pointsToBytes = (points: any[], byteCount: number): Uint8Array => {
    if (points.length * POINT_CONTENT_SIZE < byteCount)
        throw new Error("Too many bytes to be decoded from points");

    const bytes = points
        .map((point) => pointToBytes(point))
        .flat()

    const contentBytes = bytes.slice(0, byteCount)
    const paddingBytes = bytes.slice(byteCount)
    if (paddingBytes.some((byte) => byte != 0))
        throw new Error("Invalid encoding of points");

    return Uint8Array.from(contentBytes)
}

/**
 * It turns bytes into a bignum (used as x coordinate of the point) by:
 * [adjusting bytes] + [0x00 padding bytes] + [bytes]
 * Padding doesn't happen in case `bytes` is of exact size.
 * The amount of adjusting bytes is configurable by setting `ADJUSTING_BYTE_COUNT`.
 * Construct the point encoding by:
 * [0x02 encoding flag byte] + [x coordinate bytes]
 * Try to decode the point. If invalid, increment the adjusting bytes and retry.
 * The adjusting bytes are incremented by adding x = x + INCREMENTER.
 *
 * @param {bytes} the bytes to be encoded as one point.
 * @return {sjcl.ecc.point} The point representing encoding of the bytes
 */
const bytesToPoint = (bytes: number[]): any => {
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
            x = x.add(INCREMENTER)
        }
    }

    throw new Error("point encoding adjusting bytes exhausted")
}

/**
 * It parses the x coordinate of the point as:
 * [adjusting bytes] + [`POINT_CONTENT_SIZE` bytes]
 * @param {point} The sjcl.ec.point to be decoded into bytes.
 * @return {array of number} The array of bytes
 */
const pointToBytes = (point: any): number[]  => {
    if (point.isIdentity)
        throw new Error("identity point is not a valid point encoding")

    const xBits = point.x.toBits()
    const offset = sjcl.bitArray.bitLength(xBits) - (POINT_CONTENT_SIZE * 8)
    const contentBits = sjcl.bitArray.bitSlice(xBits, offset)

    return sjcl.codec.bytes.fromBits(contentBits)
}

const padBytesRight = (bytes: Uint8Array, size: number): Uint8Array => {
    const paddedBytes = new Uint8Array(size)
    paddedBytes.fill(0)
    paddedBytes.set(bytes, 0)   // pad on the right

    return paddedBytes
}

function computeIncrementer(): any {
    const pointSize = Math.floor(crypto.Curve.field.prototype.exponent / 8)
    const incrementerSize = pointSize - ADJUSTING_BYTE_COUNT + 1

    // Fill the byte array with 0x00 and set the left most byte to 0x01
    const incrementerBytes = new Uint8Array(incrementerSize)
    incrementerBytes.set([1])

    return sjcl.bn.fromBits(sjcl.codec.bytes.toBits(Array.from(incrementerBytes)))
}

function computePointContentSize(): number {
    const pointSize = Math.floor(crypto.Curve.field.prototype.exponent / 8)
    const pointContentSize = pointSize - ADJUSTING_BYTE_COUNT

    return pointContentSize
}
