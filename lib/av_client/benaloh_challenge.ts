const Crypto = require('./aion_crypto.js')()

export default class BenalohChallenge {
  connector: any;

  constructor(connector) {
    this.connector = connector;
  }

  async getServerRandomizers() {
    const { data } = await this.connector.getRandomizers()

    if (data.error) {
      return Promise.reject(data.error.description)
    }

    return data.randomizers
  }
}

interface Connector {
  getRandomizers: () => any,
}

interface ContestIndexed<Type> {
  [index: string]: Type;
}
