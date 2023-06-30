"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ByteArrayReader = void 0;
var stringPadding = /\0+$/;
var ByteArrayReader = /** @class */ (function () {
    /**
     * constructs a ByteArrayReader as a wrapper around the given byte array
     *
     * @param byteArray the wrapped byte array
     */
    function ByteArrayReader(byteArray) {
        this.pointer = 0;
        this.byteArray = byteArray;
    }
    /**
     * Reads an amount of bytes from the position of the pointer.
     * The requested bytes will be returned as a Uint8Array.
     *
     * @throws Error('Out of bounds') in there are not enough bytes left to read
     * @param length amount of bytes to read
     * @returns array of bytes
     */
    ByteArrayReader.prototype.read = function (length) {
        if (this.pointer + length > this.byteArray.length) {
            throw new Error('Out of bounds');
        }
        var out = new Uint8Array(this.byteArray.buffer, this.pointer, length);
        this.pointer += length;
        return out;
    };
    /**
     * Reads the remainder of the array to check if we have any more bytes
     * that are not null.
     *
     * @returns true if there are more bytes to read, false otherwise
     */
    ByteArrayReader.prototype.hasMore = function () {
        var remainder = this.byteArray.slice(this.pointer);
        return remainder.some(function (e) { return e !== 0; });
    };
    /**
     * Reads an amount of bytes and converts to a positive integer
     *
     * @param size amount of bytes to read and interpret to number
     * @returns number
     */
    ByteArrayReader.prototype.readInteger = function (size) {
        var bytes = this.read(size);
        return bytes.reduce(function (sum, byte) { return sum * 256 + byte; }, 0);
    };
    /**
     * Reads an amount of bytes and converts to a (utf8) string.
     * Any zero bytes by the end of the string is considered padding
     * and are discarded before the string is returned.
     *
     * @param size amount of bytes to read and interpret as string
     * @returns string
     */
    ByteArrayReader.prototype.readString = function (size) {
        var bytes = this.read(size);
        var text = new TextDecoder().decode(bytes);
        return text.replace(stringPadding, '');
    };
    return ByteArrayReader;
}());
exports.ByteArrayReader = ByteArrayReader;
//# sourceMappingURL=byte_array_reader.js.map