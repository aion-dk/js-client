const axios = require('axios')

export default class Connector {
  votingServiceURL: string;
  timeout: number;
  backend: any;
  voterSessionUuid: string;

  constructor(votingServiceURL, timeout=1000) {
    this.votingServiceURL = votingServiceURL;
    this.timeout = timeout;
    this.createBackendClient();
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
        challenges: challenges
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

  createBackendClient() {
    this.backend = axios.create({
      baseURL: this.votingServiceURL,
      withCredentials: false,
      timeout: this.timeout,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }
}
