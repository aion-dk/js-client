import { ContestMap, SealedEnvelope, VoterSessionItem } from '../types';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { BulletinBoardError, NetworkError, UnsupportedServerReplyError } from "../errors";

interface BulletinBoardData {
  error: undefined | {
    code: string;
    description: string
  };
}

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
    return this.backend.get('election_config');
  }

  async createVoterRegistration(authToken: string, parentAddress: string): Promise<VoterSessionItem> {
    const response = await this.backend.post('registrations', {
      auth_token: authToken,
      parent_address: parentAddress
    }).catch(error => {
      const response = error.response as AxiosResponse<BulletinBoardData>;
      if (error.request && !response) {
        throw new NetworkError('Network error. Could not connect to Bulletin Board.');
      }

      if ([403, 500].includes(response.status) && response.data) {
        if (!response.data.error || !response.data.error.code || !response.data.error.description) {
          throw new UnsupportedServerReplyError(`Unsupported Bulletin Board server error message: ${JSON.stringify(error.response.data)}`)
        }

        const errorMessage = response.data.error.description;
        throw new BulletinBoardError(errorMessage);
      }

      throw error;
    });

    return (response.data as VoterSessionItem)
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
