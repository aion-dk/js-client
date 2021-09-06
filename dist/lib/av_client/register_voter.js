"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerVoter = void 0;
const generate_key_pair_1 = require("./generate_key_pair");
const Crypto = require('./aion_crypto.js')();
async function registerVoter(bulletinBoard, keyPair, electionEncryptionKey, voterRecord, authorizationToken) {
    const signature = Crypto.generateSchnorrSignature('', keyPair.privateKey);
    // TODO make this call send all relevant values to the connector
    const registerVoterResponse = await bulletinBoard.registerVoter(keyPair.publicKey, signature).then(({ data }) => {
        // this.bulletinBoard.setVoterSessionUuid(data.voterSessionUuid)
        // FIXME we need to make sure that the bulletinBoard gets info about its voterSessionUuid another way
        return {
            voterSessionUuid: data.voterSessionUuid,
            voterIdentifier: data.voterIdentifier,
            emptyCryptograms: data.emptyCryptograms,
            ballots: data.ballots
        };
    });
    generate_key_pair_1.randomKeyPair(); // TODO: remove, this just increases deterministic randomness offset for tests
    const { ballots, emptyCryptograms, voterSessionUuid } = registerVoterResponse;
    const contestIds = ballots.map(ballot => ballot.id.toString());
    const challenges = Object.fromEntries(contestIds.map(contestId => {
        return [contestId, Crypto.generateRandomNumber()];
    }));
    // 
    bulletinBoard.setVoterSessionUuid(voterSessionUuid);
    const emptyCryptogramsVerified = await bulletinBoard.challengeEmptyCryptograms(challenges).then(response => {
        const responses = response.data.responses;
        const valid = contestIds.every((contestId) => {
            const emptyCryptogram = emptyCryptograms[contestId];
            const proofString = [
                emptyCryptogram.commitment,
                challenges[contestId],
                responses[contestId],
            ].join(',');
            return Crypto.verifyEmptyCryptogramProof(proofString, emptyCryptogram.cryptogram, electionEncryptionKey);
        });
        return valid;
    });
    if (!emptyCryptogramsVerified) {
        throw new Error('Empty cryptogram verification failed');
    }
    return registerVoterResponse;
}
exports.registerVoter = registerVoter;
//# sourceMappingURL=register_voter.js.map