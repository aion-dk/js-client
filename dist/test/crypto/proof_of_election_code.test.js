"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var proof_of_election_codes_1 = require("../../lib/av_client/crypto/proof_of_election_codes");
var aion_crypto_js_1 = require("../../lib/av_client/aion_crypto.js");
var util_1 = require("../../lib/av_client/crypto/util");
describe("Proof of election codes", function () {
    it("converts a single election code into a keyPair", function () {
        var electionCode = 's3cr3t5';
        var proof = new proof_of_election_codes_1.ProofOfElectionCodes([electionCode]);
        (0, chai_1.expect)(proof.mainKeyPair).to.eql({
            privateKey: "631a1838f1e82b7b39f2b620a790de69ca8feb0cfd4ba984350a5fe3a2fda299",
            publicKey: "021d1ccab6d4bc1e4cea12a13d291b2f5772f0c10e8ed4ac4c30be348137005759",
        });
    });
    it("converts multiple election codes into a keyPair", function () {
        var electionCodes = ['s3cr3t5', 't0', 'k33p'];
        var proof = new proof_of_election_codes_1.ProofOfElectionCodes(electionCodes);
        (0, chai_1.expect)(proof.mainKeyPair).to.eql({
            privateKey: "e71d8edd52ff20ff8a741a9ae0f651193e183eafd639ebde02c847b2a35f9a8d",
            publicKey: "020936bd7dacd0bfc974c717877fff2b0c4257a3ef0ea545b6acca9fa3e7857463"
        });
    });
    it("generates a discrete logarithm proof", function () {
        var electionCodes = ['s3cr3t5', 't0', 'k33p'];
        var proof = new proof_of_election_codes_1.ProofOfElectionCodes(electionCodes);
        var discreteLogarithmProof = aion_crypto_js_1.DiscreteLogarithmProof.fromString(proof.proof);
        (0, chai_1.expect)(proof.proof).to.exist;
        var publicKey = (0, util_1.pointFromHex)(proof.mainKeyPair.publicKey).toEccPoint();
        (0, chai_1.expect)(discreteLogarithmProof.verifyWithoutChallenge(aion_crypto_js_1.Curve.G, publicKey)).to.be.true;
    });
});
//# sourceMappingURL=proof_of_election_code.test.js.map