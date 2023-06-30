"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = exports.IV_BYTE_SIZE = exports.TAG_BYTE_SIZE = exports.KEY_BYTE_SIZE = void 0;
var sjcl = require("sjcl-with-all");
exports.KEY_BYTE_SIZE = 32;
exports.TAG_BYTE_SIZE = 16;
exports.IV_BYTE_SIZE = 12;
function encrypt(symmetricKey, message, iv) {
    if (iv === void 0) { iv = randomIV(); }
    var prf = new sjcl.cipher.aes(symmetricKey);
    var plaintext = sjcl.codec.utf8String.toBits(message);
    var adata = [];
    var tagBitSize = exports.TAG_BYTE_SIZE * 8;
    var ciphertextAndTag = sjcl.mode.gcm.encrypt(prf, plaintext, iv, adata, tagBitSize);
    // separate ciphertext from tag
    var bitSize = sjcl.bitArray.bitLength(ciphertextAndTag);
    var ciphertext = sjcl.bitArray.clamp(ciphertextAndTag, bitSize - tagBitSize);
    var tag = sjcl.bitArray.bitSlice(ciphertextAndTag, bitSize - tagBitSize);
    return [ciphertext, tag, iv];
}
exports.encrypt = encrypt;
function decrypt(symmetricKey, ciphertext, tag, iv) {
    var prf = new sjcl.cipher.aes(symmetricKey);
    var ciphertextAndTag = sjcl.bitArray.concat(ciphertext, tag);
    var adata = [];
    var plaintext = sjcl.mode.gcm.decrypt(prf, ciphertextAndTag, iv, adata, exports.TAG_BYTE_SIZE * 8);
    return sjcl.codec.utf8String.fromBits(plaintext);
}
exports.decrypt = decrypt;
function randomIV() {
    return sjcl.random.randomWords(exports.IV_BYTE_SIZE / 4);
}
//# sourceMappingURL=aes.js.map