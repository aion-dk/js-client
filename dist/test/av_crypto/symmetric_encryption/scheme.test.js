"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var test_helpers_1 = require("../test_helpers");
var curve_1 = require("../../../lib/av_crypto/curve");
var scheme_1 = require("../../../lib/av_crypto/symmetric_encryption/scheme");
var ciphertext_1 = require("../../../lib/av_crypto/symmetric_encryption/ciphertext");
var sjcl = require("sjcl-with-all");
describe("Symmetric Encryption scheme", function () {
    var curve = new curve_1.Curve('k256');
    var encryptionKey = (0, test_helpers_1.fixedPoint1)(curve);
    var message = 'hello';
    describe("encrypt()", function () {
        it("returns a ciphertext", function () {
            var ciphertext = (0, scheme_1.encrypt)(message, encryptionKey, curve);
            (0, chai_1.expect)(ciphertext).to.be.instanceof(ciphertext_1.Ciphertext);
        });
        context("when curve is secp521r1", function () {
            var curve = new curve_1.Curve('c521');
            var encryptionKey = (0, test_helpers_1.fixedPoint1)(curve);
            it("returns a ciphertext", function () {
                var ciphertext = (0, scheme_1.encrypt)(message, encryptionKey, curve);
                (0, chai_1.expect)(ciphertext).to.be.instanceof(ciphertext_1.Ciphertext);
            });
        });
    });
    describe("decrypt()", function () {
        var decryptionKey = (0, test_helpers_1.fixedScalar1)(curve);
        var ciphertext = new ciphertext_1.Ciphertext(sjcl.codec.base64.toBits("zBjehPc="), sjcl.codec.base64.toBits("Vk4emH3FkC4ArxZFsYBIpQ=="), sjcl.codec.base64.toBits("/KYhqGcq/oF9j4tS"), (0, test_helpers_1.fixedPoint2)(curve));
        it("returns the correct message", function () {
            var decrypted = (0, scheme_1.decrypt)(ciphertext, decryptionKey, curve);
            (0, chai_1.expect)(decrypted).to.eql(message);
        });
        context("when curve is secp521r1", function () {
            var curve = new curve_1.Curve('c521');
            var decryptionKey = (0, test_helpers_1.fixedScalar1)(curve);
            var ciphertext = new ciphertext_1.Ciphertext(sjcl.codec.base64.toBits("6W2b7Fs="), sjcl.codec.base64.toBits("S/gH4sI9C/aqVHYQrJ4adQ=="), sjcl.codec.base64.toBits("GoUG5+QYOoznKTTU"), (0, test_helpers_1.fixedPoint2)(curve));
            it("returns the correct message", function () {
                var decrypted = (0, scheme_1.decrypt)(ciphertext, decryptionKey, curve);
                (0, chai_1.expect)(decrypted).to.eql(message);
            });
        });
    });
});
//# sourceMappingURL=scheme.test.js.map