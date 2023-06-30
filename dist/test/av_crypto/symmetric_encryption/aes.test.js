"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var sjcl = require("sjcl-with-all");
var aes_1 = require("../../../lib/av_crypto/symmetric_encryption/aes");
describe("AES Encryption", function () {
    var message = 'hello';
    var key = sjcl.codec.utf8String.toBits('my nice 32 characters string key');
    describe("encrypt()", function () {
        it("returns 3 BitArray values", function () {
            var _a = (0, aes_1.encrypt)(key, message), ciphertext = _a[0], tag = _a[1], iv = _a[2];
            (0, chai_1.expect)(ciphertext).to.exist;
            (0, chai_1.expect)(tag).to.exist;
            (0, chai_1.expect)(iv).to.exist;
        });
        context("when given an initialization vector", function () {
            var inputIV = sjcl.codec.utf8String.toBits('twelve bytes');
            it("returns deterministic values", function () {
                var _a = (0, aes_1.encrypt)(key, message, inputIV), ciphertext = _a[0], tag = _a[1], iv = _a[2];
                (0, chai_1.expect)(sjcl.codec.base64.fromBits(ciphertext)).to.equal("2f0CY6k=");
                (0, chai_1.expect)(sjcl.codec.base64.fromBits(tag)).to.equal("Qm+l3fnLgiqxhw3M91fHmA==");
                (0, chai_1.expect)(sjcl.codec.base64.fromBits(iv)).to.equal("dHdlbHZlIGJ5dGVz");
            });
        });
        context("with non-32 bytes key", function () {
            var key = new sjcl.bn(1).toBits();
            it("throws error", function () {
                (0, chai_1.expect)(function () {
                    (0, aes_1.encrypt)(key, message);
                }).to.throw("invalid aes key size");
            });
        });
    });
    describe("decrypt()", function () {
        var ciphertext = sjcl.codec.base64.toBits("2f0CY6k=");
        var tag = sjcl.codec.base64.toBits("Qm+l3fnLgiqxhw3M91fHmA==");
        var iv = sjcl.codec.utf8String.toBits('twelve bytes');
        it("returns the correct messsage", function () {
            var plaintext = (0, aes_1.decrypt)(key, ciphertext, tag, iv);
            (0, chai_1.expect)(plaintext).to.equal(message);
        });
        context("with non-32 bytes key", function () {
            var key = new sjcl.bn(1).toBits();
            it("throws error", function () {
                (0, chai_1.expect)(function () {
                    (0, aes_1.decrypt)(key, ciphertext, tag, iv);
                }).to.throw("invalid aes key size");
            });
        });
    });
});
//# sourceMappingURL=aes.test.js.map