"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sha384_1 = require("../../lib/av_crypto/sha384");
var sjcl = require("sjcl-with-all");
var chai_1 = require("chai");
var test_helpers_1 = require("./test_helpers");
describe("SHA384", function () {
    var sha = sha384_1.SHA384;
    describe("hash()", function () {
        context("when given BitArray", function () {
            var data = sjcl.codec.bytes.toBits([1, 2, 3]);
            it("returns the correct value", function () {
                var digest = sha.hash(data);
                (0, chai_1.expect)(sjcl.codec.hex.fromBits(digest)).to.eql((0, test_helpers_1.hexString)("86229dc6 d2ffbeac 73807441 54aa7002" +
                    "91c06435 2a0dbdc7 7b9ed3f2 c8e1dac4" +
                    "dc325867 d39ddff1 d2629b7a 393d47f6"));
            });
            it("can handle every single byte", function () {
                var data = sjcl.codec.bytes.toBits(Array.from(Array(255).keys()));
                var digest = sha.hash(data);
                (0, chai_1.expect)(digest).to.exist;
            });
        });
        context("when given string", function () {
            var data = "hello world";
            it("returns the correct value", function () {
                var digest = sha.hash(data);
                (0, chai_1.expect)(sjcl.codec.hex.fromBits(digest)).to.eql((0, test_helpers_1.hexString)("fdbd8e75 a67f29f7 01a4e040 385e2e23" +
                    "986303ea 10239211 af907fcb b83578b3" +
                    "e417cb71 ce646efd 0819dd8c 088de1bd"));
            });
        });
    });
});
//# sourceMappingURL=sha384.test.js.map