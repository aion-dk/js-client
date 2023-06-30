"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pointsToBytes = exports.bytesToPoints = void 0;
/*eslint-disable @typescript-eslint/no-explicit-any*/
var sjcl = require("../sjcl");
var crypto = require("../aion_crypto");
var ADJUSTING_BYTE_COUNT = 1;
var INCREMENTER = computeIncrementer();
var POINT_CONTENT_SIZE = computePointContentSize();
/**
 * @param {bytes} the bytes to be encoded as points.
 * @return {array of sjcl.ecc.point} An array of points representing encoding the bytes
 */
var bytesToPoints = function (bytes) {
    var pointCount = Math.ceil(bytes.length / POINT_CONTENT_SIZE);
    // pad the byte array with 0x00 on the right side
    var paddedBytes = padBytesRight(bytes, pointCount * POINT_CONTENT_SIZE);
    var points = [];
    for (var i = 0; i < pointCount; i++) {
        var offset = i * POINT_CONTENT_SIZE;
        var bytesPartial = paddedBytes.slice(offset, offset + POINT_CONTENT_SIZE);
        var byteArray = Array.from(bytesPartial);
        points.push(bytesToPoint(byteArray));
    }
    return points;
};
exports.bytesToPoints = bytesToPoints;
/**
 * @param {points} the array of sjcl.ec.point to be decoded into bytes.
 * @param {byteCount} the amount of bytes to be returned. This is calculated as the largest size a vote could have.
 * @return {Uint8Array} The array of bytes
 */
var pointsToBytes = function (points, byteCount) {
    if (points.length * POINT_CONTENT_SIZE < byteCount)
        throw new Error("Too many bytes to be decoded from points");
    var bytes = points
        .map(function (point) { return pointToBytes(point); })
        .flat();
    var contentBytes = bytes.slice(0, byteCount);
    var paddingBytes = bytes.slice(byteCount);
    if (paddingBytes.some(function (byte) { return byte != 0; }))
        throw new Error("Invalid encoding of points");
    return Uint8Array.from(contentBytes);
};
exports.pointsToBytes = pointsToBytes;
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
var bytesToPoint = function (bytes) {
    var flagBits = sjcl.codec.bytes.toBits([2]);
    var fieldBitLength = crypto.Curve.field.modulus.bitLength();
    var x = sjcl.bn.fromBits(sjcl.codec.bytes.toBits(bytes));
    while (!x.greaterEquals(crypto.Curve.field.modulus)) {
        try {
            var xBits = x.toBits(fieldBitLength);
            var pointBits = sjcl.bitArray.concat(flagBits, xBits);
            var point = crypto.pointFromBits(pointBits);
            return point;
        }
        catch (err) {
            // increment
            x = x.add(INCREMENTER);
        }
    }
    throw new Error("point encoding adjusting bytes exhausted");
};
/**
 * It parses the x coordinate of the point as:
 * [adjusting bytes] + [`POINT_CONTENT_SIZE` bytes]
 * @param {point} The sjcl.ec.point to be decoded into bytes.
 * @return {array of number} The array of bytes
 */
var pointToBytes = function (point) {
    if (point.isIdentity)
        throw new Error("identity point is not a valid point encoding");
    var xBits = point.x.toBits();
    var offset = sjcl.bitArray.bitLength(xBits) - (POINT_CONTENT_SIZE * 8);
    var contentBits = sjcl.bitArray.bitSlice(xBits, offset);
    return sjcl.codec.bytes.fromBits(contentBits);
};
var padBytesRight = function (bytes, size) {
    var paddedBytes = new Uint8Array(size);
    paddedBytes.fill(0);
    paddedBytes.set(bytes, 0); // pad on the right
    return paddedBytes;
};
function computeIncrementer() {
    var pointSize = Math.floor(crypto.Curve.field.prototype.exponent / 8);
    var incrementerSize = pointSize - ADJUSTING_BYTE_COUNT + 1;
    // Fill the byte array with 0x00 and set the left most byte to 0x01
    var incrementerBytes = new Uint8Array(incrementerSize);
    incrementerBytes.set([1]);
    return sjcl.bn.fromBits(sjcl.codec.bytes.toBits(Array.from(incrementerBytes)));
}
function computePointContentSize() {
    var pointSize = Math.floor(crypto.Curve.field.prototype.exponent / 8);
    var pointContentSize = pointSize - ADJUSTING_BYTE_COUNT;
    return pointContentSize;
}
//# sourceMappingURL=point_encoding.js.map