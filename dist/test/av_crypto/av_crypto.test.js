"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var av_crypto_1 = require("../../lib/av_crypto");
var test_helpers_1 = require("./test_helpers");
var cryptogram_1 = require("../../lib/av_crypto/el_gamal/cryptogram");
describe("AVCrypto", function () {
    describe("constructor", function () {
        it("constructs an AV Crypto instance", function () {
            var curveName = "secp256k1";
            var crypto = new av_crypto_1.AVCrypto(curveName);
            (0, chai_1.expect)(crypto).to.be.an.instanceof(av_crypto_1.AVCrypto);
        });
        context("with valid curve names", function () {
            var supportedCurveNames = ['secp256k1', 'secp256r1', 'secp384r1', 'secp521r1'];
            it("constructs an AV Crypto instance", function () {
                supportedCurveNames.forEach(function (curveName) {
                    (0, chai_1.expect)(new av_crypto_1.AVCrypto(curveName)).to.be.an.instanceof(av_crypto_1.AVCrypto);
                });
            });
        });
        context("with invalid curve name", function () {
            it("throws error", function () {
                var curveName = "invalid";
                (0, chai_1.expect)(function () {
                    new av_crypto_1.AVCrypto(curveName);
                }).to.throw("input must be one of the followings: secp256k1, secp256r1, secp384r1, secp521r1");
            });
        });
    });
    describe("encryptVote()", function () {
        var curveName = "secp256k1";
        var crypto = new av_crypto_1.AVCrypto(curveName);
        var curve = crypto.curve;
        var vote = new TextEncoder().encode("vote");
        var encryptionKey = (0, test_helpers_1.fixedPoint1Hex)(curve);
        it("returns 1 cryptogram and 1 randomizer", function () {
            var _a = crypto.encryptVote(vote, encryptionKey), cryptograms = _a.cryptograms, randomizers = _a.randomizers;
            (0, chai_1.expect)(cryptograms.length).to.eql(1);
            (0, chai_1.expect)(randomizers.length).to.eql(1);
            (0, chai_1.expect)(cryptograms[0]).match((0, cryptogram_1.pattern)(curve));
            (0, chai_1.expect)(randomizers[0]).match(curve.scalarHexPattern());
        });
        context("with a vote that fits in multiple cryptograms", function () {
            var vote = new Uint8Array(Array(32).fill(255));
            it("returns multiple cryptograms and randomizers", function () {
                var _a = crypto.encryptVote(vote, encryptionKey), cryptograms = _a.cryptograms, randomizers = _a.randomizers;
                (0, chai_1.expect)(cryptograms.length).to.eql(2);
                (0, chai_1.expect)(randomizers.length).to.eql(2);
            });
        });
    });
    describe("combineCryptograms()", function () {
        var curveName = "secp256k1";
        var crypto = new av_crypto_1.AVCrypto(curveName);
        var curve = crypto.curve;
        var voterCryptogram = [(0, test_helpers_1.fixedPoint1Hex)(curve), (0, test_helpers_1.fixedPoint2Hex)(curve)].join(",");
        var serverCryptogram = [(0, test_helpers_1.fixedPoint1Hex)(curve), (0, test_helpers_1.fixedPoint2Hex)(curve)].join(",");
        it("returns a cryptogram", function () {
            var finalCryptogram = crypto.combineCryptograms(voterCryptogram, serverCryptogram);
            (0, chai_1.expect)(finalCryptogram).match((0, cryptogram_1.pattern)(curve));
        });
    });
    describe("revertEncryption()", function () {
        var curveName = "secp256k1";
        var crypto = new av_crypto_1.AVCrypto(curveName);
        var curve = crypto.curve;
        var vote = new TextEncoder().encode("vote");
        var encryptionKey = (0, test_helpers_1.fixedPoint1Hex)(curve);
        var _a = crypto.encryptVote(vote, encryptionKey), cryptograms = _a.cryptograms, randomizers = _a.randomizers;
        it("returns the vote back", function () {
            var decrypted = crypto.revertEncryption(cryptograms, randomizers, encryptionKey);
            (0, chai_1.expect)(decrypted.slice(0, vote.length)).to.eql(vote);
            decrypted.slice(vote.length).forEach(function (byte) {
                (0, chai_1.expect)(byte).to.eql(0);
            });
        });
        context("with a vote that fits in multiple cryptograms", function () {
            var vote = new Uint8Array(Array(32).fill(255));
            var _a = crypto.encryptVote(vote, encryptionKey), cryptograms = _a.cryptograms, randomizers = _a.randomizers;
            it("returns the vote back", function () {
                var decrypted = crypto.revertEncryption(cryptograms, randomizers, encryptionKey);
                (0, chai_1.expect)(cryptograms.length).to.eql(2);
                (0, chai_1.expect)(decrypted.slice(0, vote.length)).to.eql(vote);
                decrypted.slice(vote.length).forEach(function (byte) {
                    (0, chai_1.expect)(byte).to.eql(0);
                });
            });
        });
    });
    describe("commit()", function () {
        var curveName = "secp256k1";
        var crypto = new av_crypto_1.AVCrypto(curveName);
        var curve = crypto.curve;
        var privateEncryptionRandomizers = [
            (0, test_helpers_1.fixedScalar1Hex)(curve),
            (0, test_helpers_1.fixedScalar2Hex)(curve)
        ];
        it("returns commitment and randomizer", function () {
            var _a = crypto.commit(privateEncryptionRandomizers), commitment = _a.commitment, privateCommitmentRandomizer = _a.privateCommitmentRandomizer;
            (0, chai_1.expect)(commitment).match(curve.pointHexPattern());
            (0, chai_1.expect)(privateCommitmentRandomizer).match(curve.scalarHexPattern());
        });
        context("when given context", function () {
            var context = "hello";
            it("returns commitment and randomizer", function () {
                var _a = crypto.commit(privateEncryptionRandomizers, context), commitment = _a.commitment, privateCommitmentRandomizer = _a.privateCommitmentRandomizer;
                (0, chai_1.expect)(commitment).match(curve.pointHexPattern());
                (0, chai_1.expect)(privateCommitmentRandomizer).match(curve.scalarHexPattern());
            });
        });
    });
    describe("isValidCommitment()", function () {
        var curveName = "secp256k1";
        var crypto = new av_crypto_1.AVCrypto(curveName);
        var curve = crypto.curve;
        var privateEncryptionRandomizers = [
            (0, test_helpers_1.fixedScalar1Hex)(curve),
            (0, test_helpers_1.fixedScalar2Hex)(curve)
        ];
        var commitment = "036538ac905422a5691bb7142482e09327c1ef0fba3d1b7a803fa76112daa176ab";
        var privateCommitmentRandomizer = "842eef849fb93b5f6dde0d63786c552c87d0a3d939f529d4fa73b30cae025843";
        it("returns true", function () {
            var valid = crypto.isValidCommitment(commitment, privateCommitmentRandomizer, privateEncryptionRandomizers);
            (0, chai_1.expect)(valid).to.be.true;
        });
        context("with a different context", function () {
            var context = "hello";
            it("returns false", function () {
                var valid = crypto.isValidCommitment(commitment, privateCommitmentRandomizer, privateEncryptionRandomizers, context);
                (0, chai_1.expect)(valid).to.be.false;
            });
        });
    });
});
//# sourceMappingURL=av_crypto.test.js.map