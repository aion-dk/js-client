import Connector from '../lib/av_client/connector';
import BackendElectionConfig from '../lib/av_client/backend_election_config';
import AuthenticateWithCodes from '../lib/av_client/authenticate_with_codes';
import EncryptVotes from '../lib/av_client/encrypt_votes';

/**
 * Assembly Voting Client API.
 *
 * Expected sequence of methods being executed:
 * * {@link AVClient.authenticateWithCodes | authenticateWithCodes}
 * * {@link AVClient.getBallotList | getBallotList }
 * * {@link AVClient.getBallot | getBallot }
 * * {@link AVClient.submitBallotChoices | submitBallotChoices }
 * * {@link AVClient.submitAttestation | submitAttestation }
 * * {@link AVClient.cryptogramsForConfirmation | cryptogramsForConfirmation }
 * * {@link AVClient.submissionReceipt | submissionReceipt }
 */
export class AVClient {
  private storage: Storage;
  private connector: any;
  private electionConfig: object;

  /**
   * @param storage App developers' persistence interface that implements `get` and `set` methods.
   * @param backendUrl URL to the Assembly Voting backend server, specific for election.
   */
  constructor(storage: Storage, backendUrl: string) {
    this.storage = storage;
    this.connector = new Connector(backendUrl);
    this.electionConfig = {};
  }

  /**
   * Authenticates or rejects voter, based on their submitted election codes.
   * @param codes Array of election code strings.
   */
  async authenticateWithCodes(codes: string[]) {
    await this.updateElectionConfig();
    const authenticationResponse = await new AuthenticateWithCodes(this.connector)
      .authenticate(codes, this.electionId(), this.electionEncryptionKey());

    this.storage.set('precinctId', authenticationResponse.precinctId);
    this.storage.set('keyPair', authenticationResponse.keyPair);
    this.storage.set('emptyCryptograms', authenticationResponse.emptyCryptograms);

    return Promise.resolve('Success');
  }

  /**
   * Returns data for rendering a list of ballots
   * @return Array of ballot information objects
   */
  getBallotList() {
    return [];
  }

  /**
   * Returns data for rendering an entire ballot, for voter to make choices
   */
  getBallot(id) {
    return {};
  }

  /**
   * Submits voter ballot choices to backend server.
   * @param  ballotId ID of the ballot being submitted
   * @param  choices Voter choices for the ballot
   * @return {Promise}
   */
  async submitBallotChoices(ballotId, choices) {
    return Promise.resolve(true);
  }

  /**
   * Submits attestation object to be manually reviewed later
   * @param  attestation Attestation object to be submitted
   * @return {Promise}
   */
  async submitAttestation(attestation) {
    return Promise.resolve(true);
  }

  encryptContestSelections(contestSelections: ContestIndexed<string>) {
    const contestsData = this.prepareDataForEncryption(contestSelections);
    const encryptionResponse = new EncryptVotes().encrypt(contestsData, this.electionEncryptionKey());

    this.storage.set('voteEncryptions', encryptionResponse);

    return 'Success';
  }

  cryptogramsForConfirmation() {
    const cryptograms = {}
    const voteEncryptions = this.storage.get('voteEncryptions')
    this.contestIds().forEach(function (id) {
      cryptograms[id] = voteEncryptions[id]['cryptogram']
    })

    return cryptograms
  }

  submissionReceipt() {
    return {};
  }

  /**
   * Attempts to populate election configuration data from backend server, if it hasn't been populated yet.
   */
  private async updateElectionConfig() {
    if (Object.entries(this.electionConfig).length === 0) {
      this.electionConfig = await new BackendElectionConfig(this.connector).get();
    }
  }

  private prepareDataForEncryption(contestSelections: ContestIndexed<string>) {
    const emptyCryptograms = this.storage.get('emptyCryptograms')
    const contests = this.electionConfig['ballots']
    const contestsData = {};
    this.contestIds().forEach(function (id) {
      const contest = contests.find( b => b['id'] == id)
      contestsData[id] = {
        vote: contestSelections[id],
        voteEncodingType: contest['vote_encoding_type'],
        emptyCryptogram: emptyCryptograms[id]['emptyCryptogram']
      }
    })

    return contestsData
  }

  private electionId() {
    return this.electionConfig['election']['id'];
  }

  private contestIds() {
    return this.electionConfig['ballots'].map(ballot => ballot['id'])
  }

  private electionEncryptionKey() {
    return this.electionConfig['encryptionKey']
  }
}

/**
 * Setter/getter for persistence layer of the application
 */
export interface Storage {
  /** Returns value that is persisted at `key`. **/
  get: (key: string) => any;
  /** Persists `value` at `key`. **/
  set: (key: string, value: any) => any;
}

interface ContestIndexed<Type> {
  [index: string]: Type;
}
