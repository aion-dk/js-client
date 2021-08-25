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
        if (error.response) {
          if( error.response.status === 403 ){
            switch (error.response.data?.token) {
              case 'expired':
                throw new AccessCodeExpired('OTP code expired')
              case 'invalid':
                throw new AccessCodeInvalid('OTP code invalid')
              default: // fall through to
            }
          }
        } else if (error.request) {
          // The request was made but no response was received
          throw new NetworkError('Network error')
        }

        // Something happened in setting up the request and triggered an Error
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
