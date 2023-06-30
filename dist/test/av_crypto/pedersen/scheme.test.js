"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var test_helpers_1 = require("../test_helpers");
var curve_1 = require("../../../lib/av_crypto/curve");
var mocha_1 = require("mocha");
var scheme_1 = require("../../../lib/av_crypto/pedersen/scheme");
var commitment_1 = require("../../../lib/av_crypto/pedersen/commitment");
var utils_1 = require("../../../lib/av_crypto/utils");
(0, mocha_1.describe)("Pedersen commitment scheme", function () {
    var curve = new curve_1.Curve('k256');
    var messages = (0, test_helpers_1.fixedScalar1)(curve);
    var contextString = "hello";
    (0, mocha_1.describe)("commit()", function () {
        it("returns a commitment", function () {
            var commitment = (0, scheme_1.commit)(messages, contextString, curve);
            (0, chai_1.expect)(commitment).to.be.instanceof(commitment_1.Commitment);
        });
        context("with multiple messages", function () {
            var messages = [(0, test_helpers_1.fixedScalar1)(curve), (0, test_helpers_1.fixedScalar2)(curve)];
            it("returns a commitment", function () {
                var commitment = (0, scheme_1.commit)(messages, contextString, curve);
                (0, chai_1.expect)(commitment).to.be.instanceof(commitment_1.Commitment);
            });
        });
        context("with fixed randomness", function () {
            var randomness = (0, test_helpers_1.fixedKeyPair)(curve);
            it("returns a deterministic commitment", function () {
                var commitment = (0, scheme_1.commit)(messages, contextString, curve, randomness);
                (0, chai_1.expect)((0, utils_1.pointToHex)(commitment.c)).to.equal((0, test_helpers_1.hexString)("02" +
                    "5b96b0c4 fba96783 d04c749c 44127c19" +
                    "d426e9f1 b7509ef5 d16f1257 cb89ea3a"));
            });
            context("with multiple messages", function () {
                var messages = [(0, test_helpers_1.fixedScalar1)(curve), (0, test_helpers_1.fixedScalar2)(curve)];
                it("returns a different deterministic commitment", function () {
                    var commitment = (0, scheme_1.commit)(messages, contextString, curve, randomness);
                    (0, chai_1.expect)((0, utils_1.pointToHex)(commitment.c)).to.equal((0, test_helpers_1.hexString)("02" +
                        "b5ac426e 0ca333ff a8f90cc1 18446126" +
                        "b96d6bd5 7b43d8e6 6cfd091f cef8c4e9"));
                });
            });
            context("with a different context", function () {
                var contextString = "2";
                it("returns a different deterministic commitment", function () {
                    var commitment = (0, scheme_1.commit)(messages, contextString, curve, randomness);
                    (0, chai_1.expect)((0, utils_1.pointToHex)(commitment.c)).to.equal((0, test_helpers_1.hexString)("02" +
                        "1a9c3113 b9d91f88 9cfe3dd1 9b79fca1" +
                        "119f59d3 ce5557d8 d2ee624b 7862bfdb"));
                });
            });
            context("with curve secp521r1", function () {
                var curve = new curve_1.Curve('c521');
                var messages = (0, test_helpers_1.fixedScalar1)(curve);
                var randomness = (0, test_helpers_1.fixedKeyPair)(curve);
                it("returns a deterministic commitment", function () {
                    var commitment = (0, scheme_1.commit)(messages, contextString, curve, randomness);
                    (0, chai_1.expect)((0, utils_1.pointToHex)(commitment.c)).to.equal((0, test_helpers_1.hexString)("020107" +
                        "5f2983fb b214b6ef af567695 19a0e07b" +
                        "655a2851 df8bd00c 35262083 45f3cc1a" +
                        "84105dda c0f5e85a 03d8d024 0847a3fb" +
                        "6303ee14 ceae6767 0832a911 92909377"));
                });
            });
        });
    });
    (0, mocha_1.describe)("isValid()", function () {
        var c = (0, utils_1.hexToPoint)((0, test_helpers_1.hexString)("02" +
            "5b96b0c4 fba96783 d04c749c 44127c19" +
            "d426e9f1 b7509ef5 d16f1257 cb89ea3a"), curve);
        var commitment = new commitment_1.Commitment(c, (0, test_helpers_1.fixedKeyPair)(curve).sec.S);
        it("validates", function () {
            (0, chai_1.expect)((0, scheme_1.isValid)(commitment, messages, contextString, curve)).to.be.true;
        });
        context("with messages that weren't committed to", function () {
            var messages = (0, test_helpers_1.fixedScalar2)(curve);
            it("doesn't validate", function () {
                (0, chai_1.expect)((0, scheme_1.isValid)(commitment, messages, contextString, curve)).to.be.false;
            });
        });
        context("with context that wasn't committed to", function () {
            var contextString = "unicorns";
            it("doesn't validate", function () {
                (0, chai_1.expect)((0, scheme_1.isValid)(commitment, messages, contextString, curve)).to.be.false;
            });
        });
        context("with a different commitment point", function () {
            var c = curve.G();
            var commitment = new commitment_1.Commitment(c, (0, test_helpers_1.fixedKeyPair)(curve).sec.S);
            it("doesn't validate", function () {
                (0, chai_1.expect)((0, scheme_1.isValid)(commitment, messages, contextString, curve)).to.be.false;
            });
        });
        context("with a different commitment randomness", function () {
            var commitment = new commitment_1.Commitment(c, (0, test_helpers_1.fixedScalar1)(curve));
            it("doesn't validate", function () {
                (0, chai_1.expect)((0, scheme_1.isValid)(commitment, messages, contextString, curve)).to.be.false;
            });
        });
        context("with a non-openable commitment", function () {
            var commitment = new commitment_1.Commitment(c);
            it("throws error", function () {
                (0, chai_1.expect)(function () {
                    (0, scheme_1.isValid)(commitment, messages, contextString, curve);
                }).to.throw("commitment must be openable");
            });
        });
        context("with curve secp521r1", function () {
            var curve = new curve_1.Curve('c521');
            var messages = (0, test_helpers_1.fixedScalar1)(curve);
            var c = (0, utils_1.hexToPoint)((0, test_helpers_1.hexString)("020107" +
                "5f2983fb b214b6ef af567695 19a0e07b" +
                "655a2851 df8bd00c 35262083 45f3cc1a" +
                "84105dda c0f5e85a 03d8d024 0847a3fb" +
                "6303ee14 ceae6767 0832a911 92909377"), curve);
            var commitment = new commitment_1.Commitment(c, (0, test_helpers_1.fixedKeyPair)(curve).sec.S);
            it("validates", function () {
                (0, chai_1.expect)((0, scheme_1.isValid)(commitment, messages, contextString, curve)).to.be.true;
            });
        });
    });
});
//# sourceMappingURL=scheme.test.js.map