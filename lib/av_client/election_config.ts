export default class ElectionConfig {
  bulletinBoard: any;

  constructor(bulletinBoard) {
    this.bulletinBoard = bulletinBoard;
  }

  get() {
    return this.bulletinBoard.getElectionConfig()
      .then(
        (response) => { return Promise.resolve(response.data) },
        (error) => { return Promise.reject(error) }
      );
  }
}
