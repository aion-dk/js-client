"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hexString = exports.fixedPoint2Hex = exports.fixedScalar2Hex = exports.fixedPoint1Hex = exports.fixedScalar1Hex = exports.fixedPoint2 = exports.fixedScalar2 = exports.fixedPoint1 = exports.fixedScalar1 = exports.fixedKeyPair = void 0;
var utils_1 = require("../../lib/av_crypto/utils");
function fixedKeyPair(curve) {
    var seed = "fixed_keypair";
    var private_key = (0, utils_1.hashIntoScalar)(seed, curve);
    return (0, utils_1.generateKeyPair)(curve, private_key);
}
exports.fixedKeyPair = fixedKeyPair;
function fixedScalar1(curve) {
    var seed = "fixed value 1";
    var private_key = (0, utils_1.hashIntoScalar)(seed, curve);
    var keyPair = (0, utils_1.generateKeyPair)(curve, private_key);
    return keyPair.sec.S;
}
exports.fixedScalar1 = fixedScalar1;
function fixedPoint1(curve) {
    var seed = "fixed value 1";
    var private_key = (0, utils_1.hashIntoScalar)(seed, curve);
    var keyPair = (0, utils_1.generateKeyPair)(curve, private_key);
    return keyPair.pub.H;
}
exports.fixedPoint1 = fixedPoint1;
function fixedScalar2(curve) {
    var seed = "fixed value 2";
    var private_key = (0, utils_1.hashIntoScalar)(seed, curve);
    var keyPair = (0, utils_1.generateKeyPair)(curve, private_key);
    return keyPair.sec.S;
}
exports.fixedScalar2 = fixedScalar2;
function fixedPoint2(curve) {
    var seed = "fixed value 2";
    var private_key = (0, utils_1.hashIntoScalar)(seed, curve);
    var keyPair = (0, utils_1.generateKeyPair)(curve, private_key);
    return keyPair.pub.H;
}
exports.fixedPoint2 = fixedPoint2;
function fixedScalar1Hex(curve) {
    return (0, utils_1.scalarToHex)(fixedScalar1(curve), curve);
}
exports.fixedScalar1Hex = fixedScalar1Hex;
function fixedPoint1Hex(curve) {
    return (0, utils_1.pointToHex)(fixedPoint1(curve));
}
exports.fixedPoint1Hex = fixedPoint1Hex;
function fixedScalar2Hex(curve) {
    return (0, utils_1.scalarToHex)(fixedScalar2(curve), curve);
}
exports.fixedScalar2Hex = fixedScalar2Hex;
function fixedPoint2Hex(curve) {
    return (0, utils_1.pointToHex)(fixedPoint2(curve));
}
exports.fixedPoint2Hex = fixedPoint2Hex;
function hexString(hex) {
    return hex.replace(/\s/g, "");
}
exports.hexString = hexString;
//# sourceMappingURL=test_helpers.js.map