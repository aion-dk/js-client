import BulletinBoard from '../lib/av_client/connectors/bulletin_board';
import ElectionConfig from '../lib/av_client/election_config';
import AuthenticateWithCodes from '../lib/av_client/authenticate_with_codes';
import EncryptVotes from '../lib/av_client/encrypt_votes';
import BenalohChallenge from './av_client/benaloh_challenge';
import SubmitVotes from './av_client/submit_votes';
import VoterAuthorizationCoordinator from './av_client/connectors/voter_authorization_coordinator';
import OTPProvider from "./av_client/connectors/otp_provider";
import { randomKeyPair} from "./av_client/generate_key_pair";

/**
 * Assembly Voting Client API.
 *
 * Expected sequence of methods being executed:
 * * {@link AVClient.authenticateWithCodes | authenticateWithCodes}
 * * {@link AVClient.getBallotList | getBallotList }
 * * {@link AVClient.getBallot | getBallot }
 * * {@link AVClient.submitBallotChoices | submitBallotChoices }
 * * {@link AVClient.submitAttestation | submitAttestation }
 * * {@link AVClient.encryptContestSelections | encryptContestSelections }
 * * {@link AVClient.cryptogramsForConfirmation | cryptogramsForConfirmation }
 * * {@link AVClient.submissionReceipt | submissionReceipt }
 */

export class AVClient {
  private authorizationTokens: any[];
  private bulletinBoard: any;
  private electionConfig: ElectionConfig;
  private emptyCryptograms: any;
  private keyPair: KeyPair;
  private voteEncryptions: any;
  private voterAuthorizationCoordinator: any;
  private voteReceipt: any;
  private voterIdentifier: string;

  /**
   * @param bulletinBoardURL URL to the Assembly Voting backend server, specific for election.
   */
  constructor(bulletinBoardURL: string) {
    this.bulletinBoard = new BulletinBoard(bulletinBoardURL);
    this.electionConfig = new ElectionConfig(this.bulletinBoard);
  }

  /**
   * Authenticates or rejects voter, based on their submitted election codes.
   * @param codes Array of election code strings.
   */
  async authenticateWithCodes(codes: string[]) {
    await this.electionConfig.fetch();
    const authenticationResponse = await new AuthenticateWithCodes(this.bulletinBoard)
      .authenticate(codes, this.electionConfig.electionId(), this.electionConfig.encryptionKey());

    this.voterIdentifier = authenticationResponse.voterIdentifier;
    this.keyPair = authenticationResponse.keyPair;
    this.emptyCryptograms = authenticationResponse.emptyCryptograms;

    return 'Success';
  }

  /**
   * Takes PII, sends it to Voter Authorization Coordinator Service, for it
   * to initiate Voter Authorizers to send out OTPs to the voter.
   * @param {string} personalIdentificationInformation We don't know what this will be yet.
   */
  async requestOTPs(personalIdentificationInformation: string) {
    if (typeof personalIdentificationInformation == 'undefined') {
      throw new Error('Please provide personalIdentificationInformation');
    }

    await this.electionConfig.fetch();
    this.setupVoterAuthorizationCoordinator();

    return await this.voterAuthorizationCoordinator.requestOTPCodesToBeSent(personalIdentificationInformation).then(
      (response) => { return { numberOfOTPs: this.electionConfig.OTPProviderCount() } }
    );
  }

  /**
   * Takes the OTP codes.
   * Generates a new key pair.
   * Calls each OTP provider to authorize the public key by sending the according OTP code.
   */
  async finalizeAuthorization(otpCodes: string[]) {
    await this.electionConfig.fetch();

    if (otpCodes.length != this.electionConfig.OTPProviderCount()) {
      throw new Error('Wrong number of OTPs submitted');
    }

    const providers = this.electionConfig.OTPProviderURLs().map(
      (providerURL) => new OTPProvider(providerURL)
    );

    this.keyPair = randomKeyPair();
    const publicKey = this.publicKey();

    const requests = providers.map(function(provider, index) {
      return provider.requestOTPAuthorization(otpCodes[index], publicKey)
    });

    await Promise.all(requests).then(
      (tokens) => this.authorizationTokens = tokens,
      (error) => Promise.reject('OTP authorization failed')
    );

    return 'Success'
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

  /**
   * Encrypts all voter ballot choices.
   * @param  contestSelections Object containing the selections for each contest
   * @return {String}
   */
  encryptContestSelections(contestSelections: ContestIndexed<string>) {
    const contestsData = this.prepareDataForEncryption(contestSelections);
    const encryptionResponse = new EncryptVotes().encrypt(contestsData, this.electionConfig.encryptionKey());

    this.voteEncryptions = encryptionResponse

    return 'Success';
  }

  async startBenalohChallenge() {
    return await new BenalohChallenge(this.bulletinBoard).getServerRandomizers()
  }

  /**
   * Returns data for rendering the list of cryptograms of the ballot
   * @return Object containing a cryptogram for each contest
   */
  cryptogramsForConfirmation() {
    const cryptograms = {}
    const voteEncryptions = this.voteEncryptions
    this.contestIds().forEach(function (id) {
      cryptograms[id] = voteEncryptions[id].cryptogram
    })

    return cryptograms
  }

  /**
   * Prepares the vote submission package.
   * Submits encrypted voter ballot choices to backend server.
   * @return {Promise} Returns the vote receipt as a promise.
   */
  async signAndSubmitEncryptedVotes() {
    const voterIdentifier = this.voterIdentifier
    const electionId = this.electionConfig.electionId()
    const voteEncryptions = this.voteEncryptions
    const privateKey = this.privateKey();
    const signatureKey = this.electionConfig.signingPublicKey();

    return await new SubmitVotes(this.bulletinBoard)
      .signAndSubmitVotes({
        voterIdentifier,
        electionId,
        voteEncryptions,
        privateKey,
        signatureKey
    });
  }

  submissionReceipt() {
    return {};
  }

  private setupVoterAuthorizationCoordinator() {
    this.voterAuthorizationCoordinator = new VoterAuthorizationCoordinator(
      this.electionConfig.voterAuthorizationCoordinatorURL()
    );
  }

  /**
   * Gathers all data needed for encrypting the vote selections.
   */
  private prepareDataForEncryption(contestSelections: ContestIndexed<string>) {
    const emptyCryptograms = this.emptyCryptograms
    const contests = this.electionConfig.ballots()
    const contestsData = {};
    this.contestIds().forEach(function (id) {
      const contest = contests.find( b => b.id == id)
      contestsData[id] = {
        vote: contestSelections[id],
        voteEncodingType: contest.vote_encoding_type,
        emptyCryptogram: emptyCryptograms[id].cryptogram
      }
    })

    return contestsData
  }

  private contestIds() {
    return this.electionConfig.ballots().map(ballot => ballot.id)
  }

  private privateKey() {
    return this.keyPair.privateKey
  }

  private publicKey() {
    return this.keyPair.publicKey
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

/**
 * Used for structuring data that is indexed under contests
 * @template Type defines the data type
 */
interface ContestIndexed<Type> {
  /** The contest 'id' **/
  [index: string]: Type;
}

declare type KeyPair = {
  privateKey: string;
  publicKey: string;
};
