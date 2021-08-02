export default class ElectionConfig {
  bulletinBoard: any;
  data: any;

  constructor(bulletinBoard) {
    this.bulletinBoard = bulletinBoard;
    this.data = {}
  }

  /**
   * Attempts to populate election configuration data from backend server, if it hasn't been populated yet.
   */
  async fetch() {
    if (Object.entries(this.data).length !== 0) return;

    return this.bulletinBoard.getElectionConfig()
      .then(
        (response) => {
          let configData = response.data;
          configData.voterAuthorizationCoordinatorURL = 'http://localhost:1234';
          configData.OTPProviderCount = 2;
          configData.OTPProviderURLs = [
            'http://localhost:1111',
            'http://localhost:2222'
          ]
          this.data = configData;
        },
        (error) => { return Promise.reject(error) }
      );
  }

  OTPProviderCount() {
    return this.data.OTPProviderCount;
  }

  OTPProviderURLs() {
    return this.data.OTPProviderURLs;
  }

  voterAuthorizationCoordinatorURL() {
    return this.data.voterAuthorizationCoordinatorURL;
  }

  ballots() {
    return this.data.ballots;
  }

  electionId() {
    return this.data.election.id;
  }

  encryptionKey() {
    return this.data.encryptionKey;
  }

  signingPublicKey() {
    return this.data.signingPublicKey;
  }
}
