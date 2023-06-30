"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
var ciphertext_1 = require("./ciphertext");
var sjcl = require("sjcl-with-all");
var key_derivation_1 = require("../key_derivation");
var aes_1 = require("./aes");
function encrypt(message, encryptionKey, curve) {
    var ephemeralKeyPair = sjcl.ecc.elGamal.generateKeys(curve.curve());
    var derivedKey = deriveKey(ephemeralKeyPair, encryptionKey, curve);
    var _a = (0, aes_1.encrypt)(derivedKey, message), ciphertext = _a[0], tag = _a[1], iv = _a[2];
    return new ciphertext_1.Ciphertext(ciphertext, tag, iv, encryptionKey);
}
exports.encrypt = encrypt;
function decrypt(ciphertext, decryptionKey, curve) {
    var decryptionKeyPair = sjcl.ecc.elGamal.generateKeys(curve.curve(), null, decryptionKey);
    var derivedKey = deriveKey(decryptionKeyPair, ciphertext.ephemeralPublicKey, curve);
    return (0, aes_1.decrypt)(derivedKey, ciphertext.ciphertext, ciphertext.tag, ciphertext.iv);
}
exports.decrypt = decrypt;
function deriveKey(secretKeyPair, publicPoint, curve) {
    var elGamalPublicPoint = new sjcl.ecc.elGamal.publicKey(curve.curve(), publicPoint);
    var derivedKey = secretKeyPair.sec.dhJavaEc(elGamalPublicPoint);
    return (0, key_derivation_1.hkdf)(derivedKey, aes_1.KEY_BYTE_SIZE);
}
//# sourceMappingURL=scheme.js.map