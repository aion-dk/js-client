import axios, { AxiosInstance } from 'axios'
import { AccessCodeInvalid, AccessCodeExpired, NetworkError, UnsupportedServerReplyError } from "../errors";

export type IdentityConfirmationToken = string;

export class OTPProvider {
  private backend: AxiosInstance;

  constructor(baseURL: string, timeout = 10000) {
    this.createBackendClient(baseURL, timeout);
  }

  requestOTPAuthorization(otpCode: string, email: string): Promise<IdentityConfirmationToken> {
    return this.backend.post('authorize', {
      otpCode: otpCode,
      email: email
    }).then(res => res.data.emailConfirmationToken)
      .catch(error => {

        const response = error.response;

        // The request was made but no response was received
        if (error.request && !response) {
          throw new NetworkError('Network error. Could not connect to OTP Provider.');
        }

        // If we get errors from the provider, we wrap in custom errors
        if (response && response.status === 403 && response.data) {
          if (!response.data.errorCode) {
            throw new UnsupportedServerReplyError(`Unsupported OTP Provider error message: ${JSON.stringify(error.response.data)}`)
          }

          const errorCode = response.data.errorCode;
          const errorMessage = response.data.errorMessage;

          switch(errorCode) {
            case 'OTP_SESSION_TIMED_OUT':
              throw new AccessCodeExpired('OTP code expired');
            case 'OTP_DOES_NOT_MATCH':
            case 'EMAIL_DOES_NOT_MATCH_LIVE_SESSION':
              throw new AccessCodeInvalid('OTP code invalid');
            default:
              throw new UnsupportedServerReplyError(`Unsupported OTP Provider error message: ${errorMessage}`);
          }
        }

        // If we don't understand the error, then we rethrow
        throw error
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
