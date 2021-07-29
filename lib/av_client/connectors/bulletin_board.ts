const axios = require('axios')

export default class BulletinBoard {
  private backend: any;
  voterAuthorizationCoordinator: any;
  voterSessionUuid: string;

  constructor(baseURL: string, timeout: number = 1000) {
    this.createBackendClient(baseURL, timeout);
  }

  setVoterSessionUuid(voterSessionUuid) {
    this.voterSessionUuid = voterSessionUuid
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

  private createBackendClient(baseURL: string, timeout: number) {
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
