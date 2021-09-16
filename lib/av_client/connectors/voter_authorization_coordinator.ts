import axios from 'axios'
import { IdentityConfirmationToken } from "./otp_provider";

export default class VoterAuthorizationCoordinator {
  private backend: any;

  constructor(baseURL: string, timeout = 10000) {
    this.createBackendClient(baseURL, timeout);
  }

  /**
   * 
   * @param opaqueVoterId Gets 
   * @returns 
   */
   createSession(opaqueVoterId: string, email: string): Promise<any> {
    return this.backend.post('create_session', {
      opaque_voter_id: opaqueVoterId,
      email
    });
  }

  startIdentification(sessionId): Promise<any> {
    return this.backend.post('start_identification', {
      session_id: sessionId
    });
  }

  requestPublicKeyAuthorization(sessionId: string, identityConfirmationToken: IdentityConfirmationToken, publicKey: string){
    return this.backend.post('request_authorization', {
      session_id: sessionId,
      identity_confirmation_token: identityConfirmationToken,
      public_key: publicKey
    })
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
