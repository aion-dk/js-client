"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hkdf = exports.pbkdf2 = void 0;
var sjcl = require("sjcl-with-all");
var hkdf_1 = require("@noble/hashes/hkdf");
var sha256_1 = require("@noble/hashes/sha256");
function pbkdf2(password, keyByteLength) {
    return sjcl.misc.pbkdf2(password, '', 10000, keyByteLength * 8);
}
exports.pbkdf2 = pbkdf2;
function hkdf(inputKey, keyByteLength) {
    var key = (0, hkdf_1.hkdf)(sha256_1.sha256, new Uint8Array(sjcl.codec.bytes.fromBits(inputKey)), '', '', keyByteLength);
    return sjcl.codec.bytes.toBits(key);
}
exports.hkdf = hkdf;
//# sourceMappingURL=key_derivation.js.map