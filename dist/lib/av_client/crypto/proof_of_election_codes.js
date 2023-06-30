"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProofOfElectionCodes = void 0;
var aion_crypto_js_1 = require("../aion_crypto.js");
var ProofOfElectionCodes = /** @class */ (function () {
    function ProofOfElectionCodes(electionCodes) {
        var privateKey = electionCodes
            .map(function (electionCode) { return (0, aion_crypto_js_1.electionCodeToPrivateKey)(electionCode); })
            .reduce(aion_crypto_js_1.addBigNums);
        this.proof = (0, aion_crypto_js_1.generateDiscreteLogarithmProof)(privateKey);
        var publicKey = (0, aion_crypto_js_1.generateKeyPair)(privateKey).public_key;
        this.mainKeyPair = { privateKey: privateKey, publicKey: publicKey };
    }
    return ProofOfElectionCodes;
}());
exports.ProofOfElectionCodes = ProofOfElectionCodes;
//# sourceMappingURL=proof_of_election_codes.js.map