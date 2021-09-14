import axios from 'axios'
import { AccessCodeInvalid, AccessCodeExpired, NetworkError, UnsupportedServerReplyError } from "../errors";

export interface IdentityConfirmationToken {
  token: 'authorized'
}

export class OTPProvider {
  private backend: any;

  constructor(baseURL: string, timeout: number = 10000) {
    this.createBackendClient(baseURL, timeout);
  }

  requestOTPAuthorization(otpCode: string, email: string): Promise<IdentityConfirmationToken> {
    return this.backend.post('authorize', {
      otp_code: otpCode,
      email: email
    }).then(res => res.data) // Transform the return type to a Token
      .catch(error => {

        // If we get errors from the provider, we wrap in custom errors
        if (error.response && error.response.status === 403 && error.response.data) {
          if (error.response.data.error) {
            const errorMessage = error.response.data.error;
            switch(errorMessage) {
              case 'expired': throw new AccessCodeExpired('OTP code expired'); break;
              case 'invalid': throw new AccessCodeInvalid('OTP code invalid'); break;
              default: throw new UnsupportedServerReplyError(`Unsupported server error: ${errorMessage}`);
            }
          } else {
            throw new UnsupportedServerReplyError(`Unsupported server error message: ${JSON.stringify(error.response.data)}`)
          }
        }

        // The request was made but no response was received
        if (error.request && ! error.response) {
          throw new NetworkError('Network error');
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
