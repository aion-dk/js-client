"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidHexString = exports.addPoints = exports.pointFromX = exports.generateRandomBignum = exports.hashToBignum = exports.bignumToHex = exports.bignumFromHex = exports.pointToHex = exports.pointFromHex = exports.pointFromBits = exports.Curve = void 0;
var crypto = require("../aion_crypto");
var sjcl = require("../sjcl");
var bignum_1 = require("./bignum");
var point_1 = require("./point");
exports.Curve = crypto.Curve;
// Converter functions
// --------------------------
var pointFromBits = function (bits) { return crypto.pointFromBits(bits); };
exports.pointFromBits = pointFromBits;
var pointFromHex = function (hex) { return new point_1.Point((0, exports.pointFromBits)(sjcl.codec.hex.toBits(hex))); };
exports.pointFromHex = pointFromHex;
var pointToHex = function (point) { return sjcl.codec.hex.fromBits(point.toBits(true)); };
exports.pointToHex = pointToHex;
var bignumFromHex = function (hex) { return new bignum_1.Bignum(sjcl.bn.fromBits(sjcl.codec.hex.toBits(hex))); };
exports.bignumFromHex = bignumFromHex;
var bignumToHex = function (bignum) { return sjcl.codec.hex.fromBits(bignum.toBits()); };
exports.bignumToHex = bignumToHex;
var hashToBignum = function (hash) { return new bignum_1.Bignum(crypto.hashToBn(hash)); };
exports.hashToBignum = hashToBignum;
// Other
// --------------------------
var generateRandomBignum = function () { return new bignum_1.Bignum(crypto.randomBN()); };
exports.generateRandomBignum = generateRandomBignum;
/**
 *
 * @param x x-value from with to derive y-value on the elliptic curve
 * @returns A valid point, if one exists for x. Otherwise null
 */
var pointFromX = function (x) {
    var flag = !x.isEven() ? 2 : 3;
    var flagBignum = new sjcl.bn(flag);
    var encodedPoint = sjcl.bitArray.concat(flagBignum.toBits(), x.toBits());
    try {
        return new point_1.Point((0, exports.pointFromBits)(encodedPoint));
    }
    catch (err) {
        if (err instanceof sjcl.exception.corrupt) {
            return null; // No point found on the curve
        }
        throw err;
    }
};
exports.pointFromX = pointFromX;
var addPoints = function (a, b) {
    return new point_1.Point(crypto.addPoints(a.toEccPoint(), b.toEccPoint()));
};
exports.addPoints = addPoints;
var isValidHexString = function (test) {
    if (test.length % 2 !== 0)
        return false; // Hex string must be even length
    return test.match(/^[0-9A-Fa-f]+$/) !== null;
};
exports.isValidHexString = isValidHexString;
//# sourceMappingURL=util.js.map