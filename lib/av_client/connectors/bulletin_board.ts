import { ContestMap, SealedEnvelope  } from '../types';
import axios, { AxiosInstance, AxiosResponse } from 'axios'

export class BulletinBoard {
  private backend: AxiosInstance;
  voterSessionUuid: string;

  constructor(baseURL: string, timeout = 10000) {
    this.createBackendClient(baseURL, timeout);
  }

  setVoterSessionUuid(voterSessionUuid: string): void {
    this.voterSessionUuid = voterSessionUuid
  }

  getElectionConfig(): Promise<AxiosResponse> {
    return this.backend.get('config');
  }

  // TODO: Never used?
  createSession(publicKey: string, signature: string): Promise<AxiosResponse> {
    return this.backend.post('sign_in', {
      public_key: publicKey,
      signature: signature
    });
  }

  registerVoter(registrationToken: string, publicKeyToken: string, signature: string): Promise<AxiosResponse> {
    return this.backend.post('register', {
      registration_token: registrationToken,
      public_key_token: publicKeyToken,
      signature: signature
    });
  }

  challengeEmptyCryptograms(challenges: ContestMap<string>): Promise<AxiosResponse> {
    return this.backend.post('challenge_empty_cryptograms', {
        challenges
      }, {
        headers: {
          'X-Voter-Session': this.voterSessionUuid
        }
      });
  }

  getRandomizers(): Promise<AxiosResponse> {
    return this.backend.post('get_randomizers', {}, {
      headers: {
        'X-Voter-Session': this.voterSessionUuid
      }
    });
  }

  getCommitmentOpening(voterCommitmentOpening: ContestMap<string[]>, encryptedBallotCryptograms: ContestMap<string>): Promise<AxiosResponse> {
    return this.backend.post('get_commitment_opening', {
      voter_commitment_opening: voterCommitmentOpening,
      encrypted_ballot_cryptograms: encryptedBallotCryptograms
    }, {
      headers: {
        'X-Voter-Session': this.voterSessionUuid
      }
    });
  }

  getBoardHash(): Promise<AxiosResponse> {
    return this.backend.get('get_latest_board_hash', {
      headers: {
        'X-Voter-Session': this.voterSessionUuid
      }
    });
  }

  submitVotes(contentHash: string, signature: string, cryptogramsWithProofs: ContestMap<SealedEnvelope>, encryptedAffidavit: string): Promise<AxiosResponse> {
    return this.backend.post('submit_votes', {
      content_hash: contentHash,
      encrypted_affidavit: encryptedAffidavit,
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
