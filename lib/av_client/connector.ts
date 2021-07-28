const axios = require('axios')

export default class Connector {
  votingServiceURL: string;
  timeout: number;
  backend: any;
  voterAuthorizationCoordinator: any;
  voterSessionUuid: string;

  constructor(votingServiceURL, timeout=1000) {
    this.votingServiceURL = votingServiceURL;
    this.timeout = timeout;
    this.createBackendClient();
  }

  setVoterSessionUuid(voterSessionUuid) {
    this.voterSessionUuid = voterSessionUuid
  }

  setVoterAuthorizationCoordinator(url) {
    this.voterAuthorizationCoordinator = axios.create({
      baseURL: url,
      withCredentials: false,
      timeout: this.timeout,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  getElectionConfig() {
    return this.backend.get('config');
  }

  requestOTPCodesToBeSent(personalIdentificationInformation) {
    return this.voterAuthorizationCoordinator.post('initiate', {
      personal_identification_information: personalIdentificationInformation
    });
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
