"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var scheme_1 = require("../../../lib/av_crypto/el_gamal/scheme");
var test_helpers_1 = require("../test_helpers");
var curve_1 = require("../../../lib/av_crypto/curve");
var cryptogram_1 = require("../../../lib/av_crypto/el_gamal/cryptogram");
describe("ElGamal scheme", function () {
    var curve = new curve_1.Curve('k256');
    var encryptionKey = (0, test_helpers_1.fixedPoint1)(curve);
    var message = (0, test_helpers_1.fixedPoint2)(curve);
    describe("encrypt()", function () {
        it("returns a cryptogram", function () {
            var cryptogram = (0, scheme_1.encrypt)(message, encryptionKey, curve);
            (0, chai_1.expect)(cryptogram).to.be.instanceof(cryptogram_1.Cryptogram);
        });
        context("when given randomness", function () {
            var randomness = (0, test_helpers_1.fixedKeyPair)(curve);
            it("produces a deterministic cryptogram", function () {
                var cryptogram = (0, scheme_1.encrypt)(message, encryptionKey, curve, randomness);
                (0, chai_1.expect)(cryptogram.toString()).to.equal((0, test_helpers_1.hexString)("03" +
                    "fdb56f2d 282189d5 592305cc cc5ba3f3" +
                    "b9e2d6a8 f373b436 4a7a20e1 54bac1b1" +
                    "," +
                    "03" +
                    "16b19bac 2033c9d5 63d0399d 26bfd10b" +
                    "a3cba736 aad9fa98 e4daad13 4bd07911"));
            });
        });
    });
    describe("decrypt()", function () {
        var cryptogram = (0, cryptogram_1.fromString)((0, test_helpers_1.hexString)("03" +
            "fdb56f2d 282189d5 592305cc cc5ba3f3" +
            "b9e2d6a8 f373b436 4a7a20e1 54bac1b1" +
            "," +
            "03" +
            "16b19bac 2033c9d5 63d0399d 26bfd10b" +
            "a3cba736 aad9fa98 e4daad13 4bd07911"), curve);
        it("returns the correct point", function () {
            var point = (0, scheme_1.decrypt)(cryptogram, (0, test_helpers_1.fixedScalar1)(curve));
            (0, chai_1.expect)(point).to.eql(message);
        });
    });
    describe("homomorphicallyAdd()", function () {
        var cryptograms = [
            new cryptogram_1.Cryptogram((0, test_helpers_1.fixedPoint1)(curve), (0, test_helpers_1.fixedPoint2)(curve)),
            new cryptogram_1.Cryptogram((0, test_helpers_1.fixedPoint1)(curve), (0, test_helpers_1.fixedPoint2)(curve))
        ];
        it("produces a deterministic cryptogram", function () {
            var sum = (0, scheme_1.homomorphicallyAdd)(cryptograms);
            (0, chai_1.expect)(sum.toString()).to.equal((0, test_helpers_1.hexString)("02" +
                "6da32183 6e35dbff d81be7d4 fabd0a75" +
                "ed48548b 8e1b4847 0f719c7a cd1be877" +
                "," +
                "03" +
                "f9537231 f541273a b4c0c61e 02e6ed1b" +
                "0a90d4db 0ce563c4 734ced28 18050fdb"));
        });
    });
});
//# sourceMappingURL=scheme.test.js.map