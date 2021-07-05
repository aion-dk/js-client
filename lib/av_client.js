const Connector = require('../lib/av_client/connector.js');
const BackendElectionConfig = require('../lib/av_client/backend_election_config.js')
const AuthenticateWithCodes = require('../lib/av_client/authenticate_with_codes.js')

class AVClient {
  constructor(storage) {
    this.storage = storage;
    this.connector = new Connector('http://localhost:3000/test/app');
    this.electionConfig = {};
  }

  async authenticateWithCodes(codes) {
    await this.updateElectionConfig();
    return await new AuthenticateWithCodes(this.connector, this.storage)
      .authenticate(codes, this.electionConfig.election.id, this.electionConfig.encryptionKey);
  }

  async updateElectionConfig() {
    if (Object.entries(this.electionConfig).length === 0) {
      this.electionConfig = await new BackendElectionConfig(this.connector).get();
    }
  }
}

module.exports = AVClient
