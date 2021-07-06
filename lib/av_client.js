const Connector = require('../lib/av_client/connector.js');
const BackendElectionConfig = require('../lib/av_client/backend_election_config.js')
const AuthenticateWithCodes = require('../lib/av_client/authenticate_with_codes.js')

/**
 * @class
 * @desc Assembly Voting Client
 */
class AVClient {
  /**
   * @constructor
   * @param storage App developers' storage interface that implements generic `get` and `set` methods.
   * @param {string} backendUrl URL to the Assembly Voting backend server, specific for election.
   */
  constructor(storage, backendUrl) {
    this._storage = storage;
    this._connector = new Connector(backendUrl);
    this._electionConfig = {};
  }

  /**
   * @desc Authenticates or rejects a user, based on their submitted election codes.
   * @function
   * @param {string[]} codes Array of election code strings
   * @returns {Promise}
   */
  async authenticateWithCodes(codes) {
    await this._updateElectionConfig();
    return await new AuthenticateWithCodes(this._connector, this._storage)
      .authenticate(codes, this._electionConfig.election.id, this._electionConfig.encryptionKey);
  }

  /**
   * @desc Returns data for rendering a list of ballots
   * @return {array} Array of ballot information objects
   */
  getBallotList() {
    return [];
  }

  /**
   * @desc Returns data for rendering an entire ballot, for voter to make choices
   */
  getBallot(id) {
    return {};
  }

  /**
   * @desc Submits voter ballot choices to backend server.
   * @param  {string} ballotId ID of the ballot being submitted
   * @param  {object} choices Voter choices for the ballot
   * @return {Promise}
   */
  async submitBallotChoices(ballotId, choices) {
    return Promise.resolve(true);
  }

  /**
   * @desc Submits attestation object to be manually reviewed later
   * @param  attestation Attestation object to be submitted
   * @return {Promise}
   */
  async submitAttestation(attestation) {
    return Promise.resolve(true);
  }

  cryptogramsForConfirmation() {
    return [];
  }

  submissionReceipt() {
    return {};
  }

  /**
   * @desc Attempts to populate election configuration data from backend server, if it hasn't been populated yet.
   */
  async _updateElectionConfig() {
    if (Object.entries(this._electionConfig).length === 0) {
      this._electionConfig = await new BackendElectionConfig(this._connector).get();
    }
  }
}

module.exports = AVClient
