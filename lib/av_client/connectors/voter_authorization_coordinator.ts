import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { IdentityConfirmationToken } from "./otp_provider";
import { EmailDoesNotMatchVoterRecordError, NetworkError, UnsupportedServerReplyError } from "../errors";

export default class VoterAuthorizationCoordinator {
  private backend: AxiosInstance;

  constructor(baseURL: string, timeout = 10000) {
    this.createBackendClient(baseURL, timeout);
  }

  /**
   * 
   * @param opaqueVoterId Gets 
   * @returns 
   */
  createSession(opaqueVoterId: string, email: string): Promise<AxiosResponse> {
    return this.backend.post('create_session', {
      opaqueVoterId: opaqueVoterId,
      email
    }).catch(error => {
      const response = error.response;

      if (error.request && !response) {
        throw new NetworkError('Network error. Could not connect to Voter Authorization Coordinator.');
      }

      if ([403, 500].includes(response.status) && response.data) {
        const errorCode = response.data.error_code;
        const errorMessage = response.data.error_message;
        switch(errorCode) {
          case 'EMAIL_DOES_NOT_MATCH_VOTER_RECORD':
            throw new EmailDoesNotMatchVoterRecordError(errorMessage);
          case 'COULD_NOT_CONNECT_TO_OTP_PROVIDER':
            throw new NetworkError(errorMessage);
          default: throw new UnsupportedServerReplyError(`Unsupported server error: ${errorMessage}`);
        }
      }

      throw error;
    });
  }

  requestPublicKeyAuthorization(sessionId: string, identityConfirmationToken: IdentityConfirmationToken, publicKey: string): Promise<AxiosResponse> {
    return this.backend.post('request_authorization', {
      sessionId: sessionId,
      emailConfirmationToken: identityConfirmationToken,
      publicKey: publicKey
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
