const axios = require('axios')

export default class OTPProvider {
  private backend: any;

  constructor(baseURL: string, timeout: number = 1000) {
    this.createBackendClient(baseURL, timeout);
  }

  requestOTPAuthorization(otpCode: string, email: string): Promise<any> {
    return this.backend.post('authorize', {
      otp_code: otpCode,
      email: email
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
