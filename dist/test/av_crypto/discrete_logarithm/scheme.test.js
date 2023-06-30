"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var test_helpers_1 = require("../test_helpers");
var curve_1 = require("../../../lib/av_crypto/curve");
var mocha_1 = require("mocha");
var scheme_1 = require("../../../lib/av_crypto/discrete_logarithm/scheme");
var proof_1 = require("../../../lib/av_crypto/discrete_logarithm/proof");
(0, mocha_1.describe)("Discrete logarithm scheme", function () {
    var curve = new curve_1.Curve('k256');
    var knowledge = (0, test_helpers_1.fixedScalar1)(curve);
    var generators = [(0, test_helpers_1.fixedPoint2)(curve)];
    var contextString = "a";
    (0, mocha_1.describe)("prove()", function () {
        it("returns a proof", function () {
            var proof = (0, scheme_1.prove)(knowledge, contextString, curve, generators);
            (0, chai_1.expect)(proof).to.be.instanceof(proof_1.Proof);
        });
        context("without generators", function () {
            it("returns a proof", function () {
                var proof = (0, scheme_1.prove)(knowledge, contextString, curve);
                (0, chai_1.expect)(proof).to.be.instanceof(proof_1.Proof);
            });
        });
        context("with fixed randomness", function () {
            var randomness = (0, test_helpers_1.fixedKeyPair)(curve);
            var proof = (0, scheme_1.prove)(knowledge, contextString, curve, generators, randomness);
            it("returns a deterministic proof", function () {
                (0, chai_1.expect)(proof.toString()).to.equal((0, test_helpers_1.hexString)("03" +
                    "0973ebf8 4bd41bf6 01e01003 5b583203" +
                    "efe01407 458c54d7 15587839 80c9c482" +
                    "," +
                    "3cfd1170 dabc2b83 cff908ef 52136be7" +
                    "144f0b71 8bcf3fdc f4043e3f a772b2e8"));
            });
            context("when given points", function () {
                var points = [(0, test_helpers_1.fixedPoint2)(curve).mult((0, test_helpers_1.fixedScalar1)(curve))];
                it("generates the same proof as if points where not given", function () {
                    var otherProof = (0, scheme_1.prove)(knowledge, contextString, curve, generators, randomness, points);
                    (0, chai_1.expect)(otherProof.k).to.eql(proof.k);
                    (0, chai_1.expect)(otherProof.r).to.eql(proof.r);
                });
                context("when points are incorrect", function () {
                    // FIXME: replace this with a random point
                    var points = [curve.G()];
                    var proof = (0, scheme_1.prove)(knowledge, contextString, curve, generators, randomness, points);
                    it("generates an invalid proof", function () {
                        var valid = (0, scheme_1.isValid)(proof, contextString, generators, points, (0, test_helpers_1.fixedPoint1)(curve), curve);
                        (0, chai_1.expect)(valid).to.be.false;
                    });
                });
            });
            context("with different context", function () {
                var contextString = "b";
                it("returns a different deterministic proof", function () {
                    var proof = (0, scheme_1.prove)(knowledge, contextString, curve, generators, randomness);
                    (0, chai_1.expect)(proof.toString()).to.equal((0, test_helpers_1.hexString)("03" +
                        "0973ebf8 4bd41bf6 01e01003 5b583203" +
                        "efe01407 458c54d7 15587839 80c9c482" +
                        "," +
                        "cb212fe2 aacfffab d55b5383 9f738185" +
                        "ac3a0ee0 a020faab 2d29dc67 11f1e4ae"));
                });
            });
            context("with different knowledge", function () {
                var knowledge = (0, test_helpers_1.fixedScalar2)(curve);
                it("returns a different deterministic proof", function () {
                    var proof = (0, scheme_1.prove)(knowledge, contextString, curve, generators, randomness);
                    (0, chai_1.expect)(proof.toString()).to.equal((0, test_helpers_1.hexString)("03" +
                        "b89faa53 71d96b7a e61faecc 1fcdb4c8" +
                        "cd4f04f6 d5ca88f2 b36d6008 cae1c81b" +
                        "," +
                        "8acd9e64 0b640539 c3383e27 dae26174" +
                        "5ec971d6 011aa074 c2c2c5a9 475fd4d4"));
                });
            });
        });
        context("with curve secp521r1", function () {
            var curve = new curve_1.Curve('c521');
            var knowledge = (0, test_helpers_1.fixedScalar1)(curve);
            var generators = [(0, test_helpers_1.fixedPoint2)(curve)];
            var randomness = (0, test_helpers_1.fixedKeyPair)(curve);
            var proof = (0, scheme_1.prove)(knowledge, contextString, curve, generators, randomness);
            it("returns a deterministic proof", function () {
                (0, chai_1.expect)(proof.toString()).to.equal((0, test_helpers_1.hexString)("03005d" +
                    "be7d8393 3c729475 523914e1 e5c4a248" +
                    "25af7ee8 45eae70e e6172a84 30f47ceb" +
                    "388d86e5 e4db617b e21b21ce b59fee8b" +
                    "e0b61dec 876f3b05 6d4701c4 544a0b29" +
                    "," +
                    "0139" +
                    "3998f1ba 10d7fe67 89cf5028 f9e7d8bb" +
                    "5267f77f 5042c7e6 cf3a3e3e bf9a0b22" +
                    "61269376 4a6e56b8 dff5705c ac679c6e" +
                    "e3fe5db1 40e9c44a c2c82871 e8f5d1e2"));
            });
        });
    });
    (0, mocha_1.describe)("isValid()", function () {
        var publicKey = (0, test_helpers_1.fixedPoint1)(curve);
        var points = [(0, test_helpers_1.fixedPoint2)(curve).mult((0, test_helpers_1.fixedScalar1)(curve))];
        var proof = (0, proof_1.fromString)((0, test_helpers_1.hexString)("03" +
            "0973ebf8 4bd41bf6 01e01003 5b583203" +
            "efe01407 458c54d7 15587839 80c9c482" +
            "," +
            "3cfd1170 dabc2b83 cff908ef 52136be7" +
            "144f0b71 8bcf3fdc f4043e3f a772b2e8"), curve);
        it("validates", function () {
            (0, chai_1.expect)((0, scheme_1.isValid)(proof, contextString, generators, points, publicKey, curve)).to.be.true;
        });
        context("with generators that weren't part of the proof", function () {
            var generators = [(0, test_helpers_1.fixedPoint1)(curve)];
            it("doesn't validate", function () {
                (0, chai_1.expect)((0, scheme_1.isValid)(proof, contextString, generators, points, publicKey, curve)).to.be.false;
            });
        });
        context("with points that weren't part of the proof", function () {
            // FIXME: replace with random point
            var points = [curve.G()];
            it("doesn't validate", function () {
                (0, chai_1.expect)((0, scheme_1.isValid)(proof, contextString, generators, points, publicKey, curve)).to.be.false;
            });
        });
        context("with public key that was not part of the proof", function () {
            // FIXME: replace with random point
            var publicKey = curve.G();
            it("doesn't validate", function () {
                (0, chai_1.expect)((0, scheme_1.isValid)(proof, contextString, generators, points, publicKey, curve)).to.be.false;
            });
        });
        context("with a different context", function () {
            var contextString = "b";
            it("doesn't validate", function () {
                (0, chai_1.expect)((0, scheme_1.isValid)(proof, contextString, generators, points, publicKey, curve)).to.be.false;
            });
        });
        context("with different size generators and points", function () {
            var generators = [(0, test_helpers_1.fixedPoint2)(curve), (0, test_helpers_1.fixedPoint1)(curve)];
            it("throws error", function () {
                (0, chai_1.expect)(function () {
                    (0, scheme_1.isValid)(proof, contextString, generators, points, publicKey, curve);
                }).to.throw("generators and points must have the same size");
            });
        });
        context("with curve secp521r1", function () {
            var curve = new curve_1.Curve('c521');
            var publicKey = (0, test_helpers_1.fixedPoint1)(curve);
            var generators = [(0, test_helpers_1.fixedPoint2)(curve)];
            var points = [(0, test_helpers_1.fixedPoint2)(curve).mult((0, test_helpers_1.fixedScalar1)(curve))];
            var proof = (0, proof_1.fromString)((0, test_helpers_1.hexString)("03005d" +
                "be7d8393 3c729475 523914e1 e5c4a248" +
                "25af7ee8 45eae70e e6172a84 30f47ceb" +
                "388d86e5 e4db617b e21b21ce b59fee8b" +
                "e0b61dec 876f3b05 6d4701c4 544a0b29" +
                "," +
                "0139" +
                "3998f1ba 10d7fe67 89cf5028 f9e7d8bb" +
                "5267f77f 5042c7e6 cf3a3e3e bf9a0b22" +
                "61269376 4a6e56b8 dff5705c ac679c6e" +
                "e3fe5db1 40e9c44a c2c82871 e8f5d1e2"), curve);
            it("validates", function () {
                (0, chai_1.expect)((0, scheme_1.isValid)(proof, contextString, generators, points, publicKey, curve)).to.be.true;
            });
        });
    });
});
//# sourceMappingURL=scheme.test.js.map