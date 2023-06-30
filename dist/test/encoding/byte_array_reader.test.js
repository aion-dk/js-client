"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var byte_array_reader_1 = require("../../lib/av_client/encoding/byte_array_reader");
describe("ByteArrayReader", function () {
    describe("read()", function () {
        it("returns an array of given length and moves pointer", function () {
            var reader = new byte_array_reader_1.ByteArrayReader(Uint8Array.of(1, 2, 3, 4));
            (0, chai_1.expect)(reader.read(2).toString()).to.equal('1,2');
            (0, chai_1.expect)(reader.read(2).toString()).to.equal('3,4');
        });
        it("throws when tying to read more bytes than available", function () {
            var reader = new byte_array_reader_1.ByteArrayReader(Uint8Array.of(1, 2, 3, 4));
            (0, chai_1.expect)(function () {
                reader.read(5);
            }).to.throw('Out of bounds');
        });
    });
    describe("readInteger()", function () {
        it("reads and returns a one-byte integer", function () {
            var reader = new byte_array_reader_1.ByteArrayReader(Uint8Array.of(42));
            (0, chai_1.expect)(reader.readInteger(1)).to.equal(42);
        });
        it("reads, converts and returns a two byte integer", function () {
            var reader = new byte_array_reader_1.ByteArrayReader(Uint8Array.of(1, 0));
            (0, chai_1.expect)(reader.readInteger(2)).to.equal(256);
        });
    });
    describe("readString()", function () {
        it("reads, converts and returns a utf8 string", function () {
            var reader = new byte_array_reader_1.ByteArrayReader(Uint8Array.of(240, 159, 146, 169));
            (0, chai_1.expect)(reader.readString(4)).to.equal('💩');
        });
        context('with invalid utf8 bytes', function () {
            it('returns the unicode replacement character', function () {
                // More on replacement character:
                // https://www.fileformat.info/info/unicode/char/fffd/index.htm
                var reader = new byte_array_reader_1.ByteArrayReader(Uint8Array.of(240, 159, 146, 169));
                (0, chai_1.expect)(reader.readString(3)).to.equal('\ufffd');
            });
        });
    });
});
//# sourceMappingURL=byte_array_reader.test.js.map