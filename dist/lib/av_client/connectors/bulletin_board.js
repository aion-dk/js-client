"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulletinBoard = void 0;
const axios = require('axios');
class BulletinBoard {
    constructor(baseURL, timeout = 1000) {
        this.createBackendClient(baseURL, timeout);
    }
    setVoterSessionUuid(voterSessionUuid) {
        this.voterSessionUuid = voterSessionUuid;
    }
    getElectionConfig() {
        return this.backend.get('config');
    }
    createSession(publicKey, signature) {
        return this.backend.post('sign_in', {
            public_key: publicKey,
            signature: signature
        });
    }
    registerVoter(publicKey, signature) {
        return this.backend.post('register', {
            public_key: publicKey,
            signature: signature
        });
    }
    challengeEmptyCryptograms(challenges) {
        return this.backend.post('challenge_empty_cryptograms', {
            challenges
        }, {
            headers: {
                'X-Voter-Session': this.voterSessionUuid
            }
        });
    }
    getRandomizers() {
        return this.backend.post('get_randomizers', {}, {
            headers: {
                'X-Voter-Session': this.voterSessionUuid
            }
        });
    }
    getCommitmentOpening(voterCommitmentOpening, encryptedBallotCryptograms) {
        return this.backend.post('get_commitment_opening', {
            voter_commitment_opening: voterCommitmentOpening,
            encrypted_ballot_cryptograms: encryptedBallotCryptograms
        }, {
            headers: {
                'X-Voter-Session': this.voterSessionUuid
            }
        });
    }
    getBoardHash() {
        return this.backend.get('get_latest_board_hash', {
            headers: {
                'X-Voter-Session': this.voterSessionUuid
            }
        });
    }
    submitVotes(contentHash, signature, cryptogramsWithProofs) {
        return this.backend.post('submit_votes', {
            content_hash: contentHash,
            signature,
            votes: cryptogramsWithProofs
        }, {
            headers: {
                'X-Voter-Session': this.voterSessionUuid
            }
        });
    }
    createBackendClient(baseURL, timeout) {
        this.backend = axios.create({
            baseURL: baseURL,
            withCredentials: false,
            timeout: timeout,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });
    }
}
exports.BulletinBoard = BulletinBoard;
//# sourceMappingURL=bulletin_board.js.map