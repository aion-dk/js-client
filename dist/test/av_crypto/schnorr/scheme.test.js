"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var test_helpers_1 = require("../test_helpers");
var curve_1 = require("../../../lib/av_crypto/curve");
var mocha_1 = require("mocha");
var utils_1 = require("../../../lib/av_crypto/utils");
var scheme_1 = require("../../../lib/av_crypto/schnorr/scheme");
var signature_1 = require("../../../lib/av_crypto/schnorr/signature");
var sjcl = require("sjcl-with-all");
(0, mocha_1.describe)("Schnorr signature scheme", function () {
    var curve = new curve_1.Curve('k256');
    var message = "hello";
    var privateKey = (0, test_helpers_1.fixedScalar1)(curve);
    (0, mocha_1.describe)("sign()", function () {
        it("returns a signature", function () {
            var signature = (0, scheme_1.sign)(message, privateKey, curve);
            (0, chai_1.expect)(signature).to.be.instanceof(signature_1.Signature);
        });
        it("can generate non-negative s values", function () {
            var privateKey = new sjcl.bn(1);
            var randomness = (0, utils_1.generateKeyPair)(curve, curve.order().sub(1));
            var signature = (0, scheme_1.sign)(message, privateKey, curve, randomness);
            (0, chai_1.expect)(signature).to.be.instanceof(signature_1.Signature);
            (0, chai_1.expect)(signature.e.greaterEquals(0)).to.equal(1);
            (0, chai_1.expect)(signature.s.greaterEquals(0)).to.equal(1);
        });
        context("when given randomness", function () {
            var randomness = (0, test_helpers_1.fixedKeyPair)(curve);
            it("produces a deterministic signature", function () {
                var signature = (0, scheme_1.sign)(message, privateKey, curve, randomness);
                (0, chai_1.expect)(signature.toString()).to.equal((0, test_helpers_1.hexString)("8ba57000 5baf7b12 9129c7e1 8b0d67a1" +
                    "10dd530d 918617df 14cbf092 636e73b6" +
                    "," +
                    "b8672425 31885b8e 9b1629cc 293bcf46" +
                    "2f43f5f6 99e090e3 3adc5af1 9215436e"));
            });
        });
        context("with curve secp521r1", function () {
            var curve = new curve_1.Curve('c521');
            var privateKey = (0, test_helpers_1.fixedScalar1)(curve);
            var randomness = (0, test_helpers_1.fixedKeyPair)(curve);
            it("returns a deterministic proof", function () {
                var signature = (0, scheme_1.sign)(message, privateKey, curve, randomness);
                (0, chai_1.expect)(signature.toString()).to.equal((0, test_helpers_1.hexString)("0000" +
                    "c7eecc52 6c649cec 817bfbab 4e0e32e3" +
                    "da2abe46 37ac0542 0dbd4215 c1f2ac4e" +
                    "9b00eda0 01154be5 9d8703a8 54caf300" +
                    "326e0d2b c35cea08 cc18e006 ad5dbf6b" +
                    "," +
                    "01c4" +
                    "f8411eb7 6104458d 2e0f43bd 971c78a1" +
                    "fd7e717a 121b5441 59f8e35e e02e0cd7" +
                    "1efd083c b0434fbc 1dd32def c45a335d" +
                    "57de6fc1 31a4a347 1d346e40 6a1525b0"));
            });
        });
    });
    (0, mocha_1.describe)("isValid()", function () {
        var signature = (0, signature_1.fromString)((0, test_helpers_1.hexString)("8ba57000 5baf7b12 9129c7e1 8b0d67a1" +
            "10dd530d 918617df 14cbf092 636e73b6" +
            "," +
            "b8672425 31885b8e 9b1629cc 293bcf46" +
            "2f43f5f6 99e090e3 3adc5af1 9215436e"), curve);
        var publicKey = (0, test_helpers_1.fixedPoint1)(curve);
        it("validates", function () {
            (0, chai_1.expect)((0, scheme_1.isValid)(signature, message, publicKey, curve)).to.be.true;
        });
        context("with a different message that wasn't in the signing", function () {
            var message = "wrong";
            it("doesn't validate", function () {
                (0, chai_1.expect)((0, scheme_1.isValid)(signature, message, publicKey, curve)).to.be.false;
            });
        });
        context("with a different public key that wasn't in the signing", function () {
            var publicKey = (0, test_helpers_1.fixedPoint2)(curve);
            it("doesn't validate", function () {
                (0, chai_1.expect)((0, scheme_1.isValid)(signature, message, publicKey, curve)).to.be.false;
            });
        });
        context("with a different signature that wasn't returned by the signing", function () {
            var signature = new signature_1.Signature((0, test_helpers_1.fixedScalar1)(curve), (0, test_helpers_1.fixedScalar2)(curve), curve);
            it("doesn't validate", function () {
                (0, chai_1.expect)((0, scheme_1.isValid)(signature, message, publicKey, curve)).to.be.false;
            });
        });
        context("with curve secp521r1", function () {
            var curve = new curve_1.Curve('c521');
            var signature = (0, signature_1.fromString)((0, test_helpers_1.hexString)("0000" +
                "c7eecc52 6c649cec 817bfbab 4e0e32e3" +
                "da2abe46 37ac0542 0dbd4215 c1f2ac4e" +
                "9b00eda0 01154be5 9d8703a8 54caf300" +
                "326e0d2b c35cea08 cc18e006 ad5dbf6b" +
                "," +
                "01c4" +
                "f8411eb7 6104458d 2e0f43bd 971c78a1" +
                "fd7e717a 121b5441 59f8e35e e02e0cd7" +
                "1efd083c b0434fbc 1dd32def c45a335d" +
                "57de6fc1 31a4a347 1d346e40 6a1525b0"), curve);
            var publicKey = (0, test_helpers_1.fixedPoint1)(curve);
            it("validates", function () {
                (0, chai_1.expect)((0, scheme_1.isValid)(signature, message, publicKey, curve)).to.be.true;
            });
        });
    });
});
//# sourceMappingURL=scheme.test.js.map