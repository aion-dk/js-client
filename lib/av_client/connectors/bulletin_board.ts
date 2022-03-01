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

  async createVoterRegistration(authToken: string, parentAddress: string): Promise<AxiosResponse> {
    const response = await this.backend.post('registrations', {
      authToken,
      parentAddress
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

    return response;
  }

  submitVotes(signedBallotCryptogramsItem): Promise<AxiosResponse> {
    return this.backend.post('votes', signedBallotCryptogramsItem, {
      headers: {
        'X-Voter-Session': this.voterSessionUuid
      }
    });
  }

  getVotingTrack(verificationStartAddress: string): Promise<AxiosResponse> {
    return this.backend.get(`verification/vote_track/${verificationStartAddress}`)
  }

  getCommitmentOpenings(verifierItemAddress: string): Promise<AxiosResponse> {
    return this.backend.get(`verification/commitment_openings/${verifierItemAddress}`)
  }

  getSpoilRequestItem(ballotCryptogramAddress: string): Promise<AxiosResponse> {
    return this.backend.get(`verification/spoil_status/${ballotCryptogramAddress}`)
  }

  getVerifierItem(spoilRequestAddress: string): Promise<AxiosResponse> {
    return this.backend.get(`verification/verifier/${spoilRequestAddress}`)
  }

  submitVerifierItem(signedVerifierItem): Promise<AxiosResponse> {
    return this.backend.post('verification/verifier', signedVerifierItem)
  }

  submitCommitmentOpenings(content): Promise<AxiosResponse> {
    return this.backend.post('verification/commitment_openings', content, {
      headers: {
        'X-Voter-Session': this.voterSessionUuid
      }
    });
  }

  submitCommitment(signedCommit): Promise<AxiosResponse> {
    return this.backend.post('commitments', signedCommit, {
      headers: {
        'X-Voter-Session': this.voterSessionUuid
      }
    });
  }

  submitCastRequest(content): Promise<AxiosResponse> {
    return this.backend.post('cast', content, {
      headers: {
        'X-Voter-Session': this.voterSessionUuid
      }
    });
  }

  submitSpoilRequest(content): Promise<AxiosResponse> {
    return this.backend.post('spoil', content, {
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
