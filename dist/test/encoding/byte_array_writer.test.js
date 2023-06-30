"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var byte_array_writer_1 = require("../../lib/av_client/encoding/byte_array_writer");
describe("ByteArrayWriter", function () {
    describe("new ByteArrayWriter()", function () {
        it("generates an internal byte array of given length prefilled with null bytes", function () {
            var writer = new byte_array_writer_1.ByteArrayWriter(5);
            (0, chai_1.expect)(writer.getByteArray().toString()).to.equal('0,0,0,0,0');
        });
    });
    describe(".write()", function () {
        it("can write to the internal byte array", function () {
            var writer = new byte_array_writer_1.ByteArrayWriter(8);
            writer.write(Uint8Array.of(1, 2, 3));
            writer.write(Uint8Array.of(4, 5, 6));
            (0, chai_1.expect)(writer.getByteArray().toString()).to.equal('1,2,3,4,5,6,0,0');
        });
        context("when exceeding the allocated amount of bytes", function () {
            it("throws error with text 'Out of bounds'", function () {
                var writer = new byte_array_writer_1.ByteArrayWriter(8);
                writer.write(Uint8Array.of(1, 2, 3));
                writer.write(Uint8Array.of(4, 5, 6));
                (0, chai_1.expect)(function () {
                    writer.write(Uint8Array.of(4, 5, 6));
                }).to.throw('Out of bounds');
            });
        });
    });
    describe(".writeInteger()", function () {
        it("can write an one byte integer to the internal byte array", function () {
            var writer = new byte_array_writer_1.ByteArrayWriter(1);
            writer.writeInteger(1, 42);
            (0, chai_1.expect)(writer.getByteArray().toString()).to.equal('42');
        });
        it("throws when the integer is too big for the allocated space", function () {
            var writer = new byte_array_writer_1.ByteArrayWriter(2);
            (0, chai_1.expect)(function () {
                writer.writeInteger(1, 256);
            }).to.throw('The provided integer requires more bytes');
        });
        it("throws when given a negative integer", function () {
            var writer = new byte_array_writer_1.ByteArrayWriter(2);
            (0, chai_1.expect)(function () {
                writer.writeInteger(1, -1);
            }).to.throw('Only non-negative integers supported');
        });
        it("throws when given a float", function () {
            var writer = new byte_array_writer_1.ByteArrayWriter(2);
            (0, chai_1.expect)(function () {
                writer.writeInteger(1, 1.543);
            }).to.throw('Only non-negative integers supported');
        });
        context("with two bytes allocated", function () {
            it("can write a one byte integer to the internal byte array", function () {
                var writer = new byte_array_writer_1.ByteArrayWriter(2);
                writer.writeInteger(2, 42);
                (0, chai_1.expect)(writer.getByteArray().toString()).to.equal('0,42');
            });
            it("can write a two byte integer to the internal byte array", function () {
                var writer = new byte_array_writer_1.ByteArrayWriter(2);
                writer.writeInteger(2, 342);
                (0, chai_1.expect)(writer.getByteArray().toString()).to.equal('1,86');
            });
            it("throws when the integer is too big for the allocated space", function () {
                var writer = new byte_array_writer_1.ByteArrayWriter(2);
                (0, chai_1.expect)(function () {
                    writer.writeInteger(2, 65536);
                }).to.throw('The provided integer requires more bytes');
            });
        });
    });
    describe(".writeString()", function () {
        it("can write a string to the internal byte array", function () {
            var writer = new byte_array_writer_1.ByteArrayWriter(10);
            writer.writeString(10, 'halløj!');
            (0, chai_1.expect)(writer.getByteArray().toString()).to.equal('104,97,108,108,195,184,106,33,0,0');
        });
        it("can write emojis", function () {
            var writer = new byte_array_writer_1.ByteArrayWriter(10);
            writer.writeString(10, '💩');
            (0, chai_1.expect)(writer.getByteArray().toString()).to.equal('240,159,146,169,0,0,0,0,0,0');
        });
        it("throws when provided string byte size is bigger than allocated space", function () {
            var writer = new byte_array_writer_1.ByteArrayWriter(10);
            (0, chai_1.expect)(function () {
                writer.writeString(5, '💩💩');
            }).to.throw('offset is out of bounds');
        });
        context("with more bytes allocated than needed", function () {
            it("appends string padded with null bytes and moves internal pointer", function () {
                var writer = new byte_array_writer_1.ByteArrayWriter(10);
                writer.writeString(5, 'one');
                writer.writeString(5, 'two');
                (0, chai_1.expect)(writer.getByteArray().toString()).to.equal('111,110,101,0,0,116,119,111,0,0');
            });
        });
    });
});
//# sourceMappingURL=byte_array_writer.test.js.map