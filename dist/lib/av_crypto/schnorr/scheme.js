"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sign = exports.isValid = void 0;
var utils_1 = require("../utils");
var signature_1 = require("./signature");
function isValid(signature, message, publicKey, curve) {
    var r = computeR(signature, publicKey, curve);
    var recomputedE = computeE(message, r, curve);
    return signature.e.equals(recomputedE);
}
exports.isValid = isValid;
function sign(message, privateKey, curve, randomness) {
    if (randomness === void 0) { randomness = (0, utils_1.generateKeyPair)(curve); }
    var e = computeE(message, randomness.pub.H, curve);
    var s = computeS(privateKey, randomness.sec.S, e, curve);
    return new signature_1.Signature(e, s, curve);
}
exports.sign = sign;
function computeE(message, r, curve) {
    var string = (0, utils_1.concatForHashing)([
        (0, utils_1.pointToHex)(r),
        message
    ]);
    return (0, utils_1.hashIntoScalar)(string, curve);
}
function computeS(privateKey, r, e, curve) {
    // sjcl mod() always returns a positive number.
    // There is no need add the curve order if it's negative.
    return r.sub(e.mul(privateKey)).mod(curve.order());
}
function computeR(signature, publicKey, curve) {
    var scalars = [signature.s, signature.e];
    var points = [curve.G(), publicKey];
    return (0, utils_1.multiplyAndSumScalarsAndPoints)(scalars, points);
}
//# sourceMappingURL=scheme.js.map