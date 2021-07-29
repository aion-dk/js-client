const axios = require('axios')

export default class VoterAuthorizationCoordinator {
  private backend: any;

  constructor(baseURL: string, timeout: number = 1000) {
    this.createBackendClient(baseURL, timeout);
  }

  requestOTPCodesToBeSent(personalIdentificationInformation): Promise<any> {
    return this.backend.post('initiate', {
      personal_identification_information: personalIdentificationInformation
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
