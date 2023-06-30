"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shortCodeToHex = exports.hexToShortCode = void 0;
var base = require("base-x");
var errors_1 = require("./errors");
var sjcl = require("./sjcl");
var BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
var bs58 = base(BASE58);
var BASE58_PAD = BASE58[0];
var HEX_PAD = '0';
/**
 * Converts from hex to base58.
 * The returned base58 string is padded to 7 chars.
 *
 * @param hex hex string of 10 chars
 * @returns a base58 string of 7 chars
 */
function hexToShortCode(input) {
    if (!input.match(/^[0-9a-f]*$/i)) {
        throw new Error('Non-hex character');
    }
    var bits = sjcl.codec.hex.toBits(input);
    var bytes = sjcl.codec.bytes.fromBits(bits);
    var byteArray = leftTrim(Uint8Array.from(bytes));
    if (byteArray.length > 5) {
        throw new errors_1.InvalidTrackingCodeError("Invalid input. Only up to 40 bits are supported.");
    }
    var encoded = bs58.encode(byteArray);
    return encoded.padStart(7, BASE58_PAD);
}
exports.hexToShortCode = hexToShortCode;
/**
 * Converts from base58 to hex.
 * The returned hex string is padded to 10 chars.
 *
 * @param input base58 string of 7 chars
 * @returns hex string of 10 chars
 */
function shortCodeToHex(input) {
    var byteArray = leftTrim(bs58.decode(input));
    if (byteArray.length > 5) {
        throw new errors_1.InvalidTrackingCodeError("Invalid input. Only up to 40 bits are supported.");
    }
    var bits = sjcl.codec.bytes.toBits(Array.from(byteArray));
    var hex = sjcl.codec.hex.fromBits(bits);
    return hex.padStart(10, HEX_PAD);
}
exports.shortCodeToHex = shortCodeToHex;
function leftTrim(byteArray) {
    var i = 0;
    while (byteArray[i] === 0)
        i++; // increase i until a non-zero is found
    return i === 0 ? byteArray : byteArray.slice(i);
}
//# sourceMappingURL=short_codes.js.map