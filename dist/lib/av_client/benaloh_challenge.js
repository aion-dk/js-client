"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Crypto = require('./aion_crypto.js')();
class BenalohChallenge {
    constructor(bulletinBoard) {
        this.bulletinBoard = bulletinBoard;
    }
    async getServerRandomizers() {
        const { data } = await this.bulletinBoard.getRandomizers();
        if (data.error) {
            return Promise.reject(data.error.description);
        }
        return data.randomizers;
    }
    async getServerCommitmentOpening(voterCommitmentOpening, encryptedBallotCryptograms) {
        const { data } = await this.bulletinBoard.getCommitmentOpening(voterCommitmentOpening, encryptedBallotCryptograms);
        if (data.error) {
            return Promise.reject(data.error.description);
        }
        return data.commitment_opening;
    }
    verifyCommitmentOpening(serverCommitmentOpening, serverCommitment, serverEmptyCryptograms) {
        // TODO: implement me
        return true;
    }
}
exports.default = BenalohChallenge;
//# sourceMappingURL=benaloh_challenge.js.map