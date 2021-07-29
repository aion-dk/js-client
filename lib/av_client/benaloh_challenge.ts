const Crypto = require('./aion_crypto.js')()

export default class BenalohChallenge {
  bulletinBoard: any;

  constructor(bulletinBoard) {
    this.bulletinBoard = bulletinBoard;
  }

  async getServerRandomizers() {
    const { data } = await this.bulletinBoard.getRandomizers()

    if (data.error) {
      return Promise.reject(data.error.description)
    }

    return data.randomizers
  }
}

interface Connector {
  getRandomizers: () => Promise<any>,
}

interface ContestIndexed<Type> {
  [index: string]: Type;
}
