"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var test_helpers_1 = require("../test_helpers");
var curve_1 = require("../../../lib/av_crypto/curve");
var sjcl = require("sjcl-with-all");
var ciphertext_1 = require("../../../lib/av_crypto/symmetric_encryption/ciphertext");
describe("Symmetric Encryption Ciphertext", function () {
    var ciphertext = sjcl.codec.utf8String.toBits("encrypted hello");
    var iv = sjcl.codec.utf8String.toBits("twelve bytes");
    var tag = sjcl.codec.utf8String.toBits("the 16 bytes tag");
    var curve = new curve_1.Curve('k256');
    var ephemeralPublicKey = (0, test_helpers_1.fixedPoint1)(curve);
    describe("constructor", function () {
        it("constructs a ciphertext", function () {
            var c = new ciphertext_1.Ciphertext(ciphertext, tag, iv, ephemeralPublicKey);
            (0, chai_1.expect)(c).to.be.instanceof(ciphertext_1.Ciphertext);
            (0, chai_1.expect)(c.ciphertext).to.eql(ciphertext);
            (0, chai_1.expect)(c.tag).to.eql(tag);
            (0, chai_1.expect)(c.iv).to.eql(iv);
            (0, chai_1.expect)(c.ephemeralPublicKey).to.eql(ephemeralPublicKey);
        });
        context("with non-16 bytes tag", function () {
            var tag = new sjcl.bn(1).toBits();
            it("throws error", function () {
                (0, chai_1.expect)(function () {
                    new ciphertext_1.Ciphertext(ciphertext, tag, iv, ephemeralPublicKey);
                }).to.throw("tag must be a 16 bytes long BitArray");
            });
        });
        context("with non-12 bytes iv", function () {
            var iv = new sjcl.bn(1).toBits();
            it("throws error", function () {
                (0, chai_1.expect)(function () {
                    new ciphertext_1.Ciphertext(ciphertext, tag, iv, ephemeralPublicKey);
                }).to.throw("iv must be a 12 bytes long BitArray");
            });
        });
    });
});
//# sourceMappingURL=ciphertext.test.js.map