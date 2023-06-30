"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.homomorphicallyAdd = exports.decrypt = exports.encrypt = void 0;
var utils_1 = require("../utils");
var cryptogram_1 = require("./cryptogram");
function encrypt(message, encryptionKey, curve, randomness) {
    if (randomness === void 0) { randomness = (0, utils_1.generateKeyPair)(curve); }
    var r = randomness.pub.H;
    var c = (0, utils_1.addPoints)([encryptionKey.mult(randomness.sec.S), message]);
    return new cryptogram_1.Cryptogram(r, c);
}
exports.encrypt = encrypt;
function decrypt(cryptogram, decryptionKey) {
    return (0, utils_1.addPoints)([cryptogram.c, cryptogram.r.mult(decryptionKey).negate()]);
}
exports.decrypt = decrypt;
function homomorphicallyAdd(cryptograms) {
    var newR = (0, utils_1.addPoints)(cryptograms.map(function (cryptogram) { return cryptogram.r; }));
    var newC = (0, utils_1.addPoints)(cryptograms.map(function (cryptogram) { return cryptogram.c; }));
    return new cryptogram_1.Cryptogram(newR, newC);
}
exports.homomorphicallyAdd = homomorphicallyAdd;
//# sourceMappingURL=scheme.js.map