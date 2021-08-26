import axios from 'axios'
import { AccessCodeInvalid, AccessCodeExpired, NetworkError } from "../errors";

export interface Token {
  token: 'authorized' | 'expired' | 'invalid';
}

export class OTPProvider {
  private backend: any;

  constructor(baseURL: string, timeout: number = 1000) {
    this.createBackendClient(baseURL, timeout);
  }

  requestOTPAuthorization(otpCode: string, email: string): Promise<Token> {
    return this.backend.post('authorize', {
      otp_code: otpCode,
      email: email
    }).then(res => res.data) // Transform the return type to a Token
      .catch(error => {

        // If we get errors from the provider, we
        if (error.response && error.response.status === 403) {
          const token = error.response.data?.token
          if( token === 'expired' ){
            throw new AccessCodeExpired('OTP code expired')
          }
          if( token === 'invalid' ){
            throw new AccessCodeInvalid('OTP code invalid')
          }
        }

        // The request was made but no response was received
        if ( error.request && ! error.response) {
          throw new NetworkError('Network error')
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
