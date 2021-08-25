const axios = require('axios')

export default class VoterAuthorizationCoordinator {
  private backend: any;

  constructor(baseURL: string, timeout: number = 1000) {
    this.createBackendClient(baseURL, timeout);
  }

  createSession(opaqueVoterId): Promise<any> {
    return this.backend.post('create_session', {
      opaque_voter_id: opaqueVoterId
    });
  }

  startIdentification(sessionId): Promise<any> {
    return this.backend.post('start_identification', {
      session_id: sessionId
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
