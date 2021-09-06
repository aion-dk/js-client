"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Crypto = require('./aion_crypto.js')();
class EncryptVotes {
    encrypt(contestSelections, emptyCryptograms, contestEncodingTypes, encryptionKey) {
        const response = {};
        Object.keys(contestSelections).forEach(function (contestId) {
            const { cryptogram, randomness } = Crypto.encryptVote(contestEncodingTypes[contestId], contestSelections[contestId], emptyCryptograms[contestId], encryptionKey);
            const proof = Crypto.generateDiscreteLogarithmProof(randomness);
            response[contestId] = { cryptogram, randomness, proof };
        });
        return response;
    }
    generateTestCode() {
        return Crypto.generateRandomNumber();
    }
    fingerprint(cryptograms) {
        const string = JSON.stringify(cryptograms);
        return Crypto.hashString(string);
    }
}
exports.default = EncryptVotes;
//# sourceMappingURL=encrypt_votes.js.map