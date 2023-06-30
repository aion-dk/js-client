"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DHPackage = exports.dhDecrypt = exports.dhEncrypt = void 0;
var crypto = require("../aion_crypto");
var sjcl = require("../sjcl");
var curve = crypto.Curve;
/**
 * Encrypt an arbitrary amount of (string) data symmetrically.
 * @param {string} encryptionKeyHex The public key of the External Verifier.
 * @param {string} message The plaintext to be encrypted.
 * @return {DHPackage} A package object with the ciphertext, the tag, the iv, and the ephemeral public key.
 */
function dhEncrypt(encryptionKeyHex, message) {
    // convert hex values to keys
    var point = crypto.pointFromBits(sjcl.codec.hex.toBits(encryptionKeyHex));
    var encryptionKey = new sjcl.ecc.elGamal.publicKey(crypto.Curve, point);
    // derive a symmetric key
    var ephemeralKeyPair = sjcl.ecc.elGamal.generateKeys(curve);
    var symmetricKey = deriveKey(ephemeralKeyPair.sec, encryptionKey);
    var _a = encrypt(symmetricKey, message), ciphertext = _a[0], tag = _a[1], iv = _a[2];
    var ephemeralPublicKey = ephemeralKeyPair.pub;
    return new DHPackage(ciphertext, tag, iv, ephemeralPublicKey);
}
exports.dhEncrypt = dhEncrypt;
/**
 * Decrypts an arbitrary amount of (string) data symmetrically.
 * @param {string} decryptionKeyHex The decryption key.
 * @param {DHPackage} dhPackage The package as returned by the dhEncrypt.
 * @return {string} The plaintext.
 */
function dhDecrypt(decryptionKeyHex, dhPackage) {
    var exponent = sjcl.bn.fromBits(sjcl.codec.hex.toBits(decryptionKeyHex));
    var decryptionKey = new sjcl.ecc.elGamal.secretKey(curve, exponent);
    var symmetricKey = deriveKey(decryptionKey, dhPackage.ephemeralPublicKey);
    return decrypt(symmetricKey, dhPackage.ciphertext, dhPackage.tag, dhPackage.iv);
}
exports.dhDecrypt = dhDecrypt;
var DHPackage = /** @class */ (function () {
    function DHPackage(ciphertext, tag, iv, ephemeralPublicKey) {
        this.ciphertext = ciphertext;
        this.tag = tag;
        this.iv = iv;
        this.ephemeralPublicKey = ephemeralPublicKey;
    }
    DHPackage.prototype.toString = function () {
        return dhPackageToString(this);
    };
    DHPackage.fromString = function (json) {
        return dhPackageFromString(json);
    };
    return DHPackage;
}());
exports.DHPackage = DHPackage;
// --------- Private functions ---------
function encrypt(symmetricKey, message) {
    var prf = new sjcl.cipher.aes(symmetricKey);
    var plaintext = sjcl.codec.utf8String.toBits(message);
    var iv = sjcl.bitArray.clamp(sjcl.random.randomWords(4), 12 * 8);
    var adata = [];
    var ts = 128;
    var ciphertextAndTag = sjcl.mode.gcm.encrypt(prf, plaintext, iv, adata, ts);
    // separate ciphertext from tag
    var cts = sjcl.bitArray.bitLength(ciphertextAndTag);
    var ciphertext = sjcl.bitArray.clamp(ciphertextAndTag, cts - ts);
    var tag = sjcl.bitArray.bitSlice(ciphertextAndTag, cts - ts);
    return [ciphertext, tag, iv];
}
function decrypt(symmetricKey, ciphertext, tag, iv) {
    var prf = new sjcl.cipher.aes(symmetricKey);
    var ciphertextAndTag = sjcl.bitArray.concat(ciphertext, tag);
    var adata = [];
    var ts = 128;
    var plaintext = sjcl.mode.gcm.decrypt(prf, ciphertextAndTag, iv, adata, ts);
    return sjcl.codec.utf8String.fromBits(plaintext);
}
function deriveKey(privateKey, publicKey) {
    var sharedSecret = privateKey.dhJavaEc(publicKey);
    var keyLength = 256;
    var salt = '';
    var info = '';
    return sjcl.misc.hkdf(sharedSecret, keyLength, salt, info);
}
function dhPackageFromString(json) {
    var encoded = JSON.parse(json);
    var ciphertext = sjcl.codec.base64.toBits(encoded.ciphertext);
    var tag = sjcl.codec.base64.toBits(encoded.tag);
    var iv = sjcl.codec.base64.toBits(encoded.iv);
    var ephemeralPublicKey = new sjcl.ecc.elGamal.publicKey(curve, crypto.pointFromBits(sjcl.codec.hex.toBits(encoded.ephemeralPublicKey)));
    return new DHPackage(ciphertext, tag, iv, ephemeralPublicKey);
}
function dhPackageToString(dhPackage) {
    var ciphertext = sjcl.codec.base64.fromBits(dhPackage.ciphertext);
    var tag = sjcl.codec.base64.fromBits(dhPackage.tag);
    var iv = sjcl.codec.base64.fromBits(dhPackage.iv);
    var ephemeralPublicKey = sjcl.codec.hex.fromBits(crypto.pointToBits(dhPackage.ephemeralPublicKey._point, true));
    return JSON.stringify({
        ciphertext: ciphertext,
        tag: tag,
        iv: iv,
        ephemeralPublicKey: ephemeralPublicKey
    });
}
//# sourceMappingURL=aes.js.map