export default class ElectionConfig {
  bulletinBoard: any;

  constructor(bulletinBoard) {
    this.bulletinBoard = bulletinBoard;
  }

  get() {
    return this.bulletinBoard.getElectionConfig()
      .then(
        (response) => {
          let configData = response.data;
          configData.voterAuthorizationCoordinatorURL = 'http://localhost:1234';
          configData.OTPProviderCount = 2;
          return Promise.resolve(configData);
        },
        (error) => { return Promise.reject(error) }
      );
  }
}
