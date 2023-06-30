"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromString = exports.Ciphertext = void 0;
var utils_1 = require("../utils");
var sjcl = require("sjcl-with-all");
var aes_1 = require("./aes");
var Ciphertext = /** @class */ (function () {
    function Ciphertext(ciphertext, tag, iv, ephemeralPublicKey) {
        if (sjcl.bitArray.bitLength(tag) != aes_1.TAG_BYTE_SIZE * 8) {
            throw new Error("tag must be a ".concat(aes_1.TAG_BYTE_SIZE, " bytes long BitArray"));
        }
        if (sjcl.bitArray.bitLength(iv) != aes_1.IV_BYTE_SIZE * 8) {
            throw new Error("iv must be a ".concat(aes_1.IV_BYTE_SIZE, " bytes long BitArray"));
        }
        this.ciphertext = ciphertext;
        this.tag = tag;
        this.iv = iv;
        this.ephemeralPublicKey = ephemeralPublicKey;
    }
    Ciphertext.prototype.toString = function () {
        var json = {
            ciphertext: sjcl.codec.base64.fromBits(this.ciphertext),
            tag: sjcl.codec.base64.fromBits(this.tag),
            iv: sjcl.codec.base64.fromBits(this.iv),
            ephemeralPublicKey: (0, utils_1.pointToHex)(this.ephemeralPublicKey)
        };
        return JSON.stringify(json);
    };
    return Ciphertext;
}());
exports.Ciphertext = Ciphertext;
function fromString(string, curve) {
    var json = JSON.parse(string);
    var ciphertext = sjcl.codec.base64.toBits(json.ciphertext);
    var tag = sjcl.codec.base64.toBits(json.tag);
    var iv = sjcl.codec.base64.toBits(json.iv);
    var ephemeralPublicKey = (0, utils_1.hexToPoint)(json.ephemeralPublicKey, curve);
    return new Ciphertext(ciphertext, tag, iv, ephemeralPublicKey);
}
exports.fromString = fromString;
//# sourceMappingURL=ciphertext.js.map