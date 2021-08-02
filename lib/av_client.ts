import BulletinBoard from '../lib/av_client/connectors/bulletin_board';
import ElectionConfig from '../lib/av_client/election_config';
import AuthenticateWithCodes from '../lib/av_client/authenticate_with_codes';
import EncryptVotes from '../lib/av_client/encrypt_votes';
import BenalohChallenge from './av_client/benaloh_challenge';
import SubmitVotes from './av_client/submit_votes';
import VoterAuthorizationCoordinator from './av_client/connectors/voter_authorization_coordinator';
import OTPProvider from "./av_client/connectors/otp_provider";
import { randomKeyPair} from "./av_client/generate_key_pair";
import validateAuthorizationToken from "./av_client/validate_authorization_token";

/**
 * Assembly Voting Client API.
 *
 * Expected sequence of methods being executed:
 * * {@link AVClient.authenticateWithCodes | authenticateWithCodes}
 * * {@link AVClient.getBallotList | getBallotList }
 * * {@link AVClient.getBallot | getBallot }
 * * {@link AVClient.submitBallotChoices | submitBallotChoices }
 * * {@link AVClient.submitAttestation | submitAttestation }
 * * {@link AVClient.encryptCVR | encryptCVR }
 * * {@link AVClient.cryptogramsForConfirmation | cryptogramsForConfirmation }
 * * {@link AVClient.submissionReceipt | submissionReceipt }
 */

export class AVClient {
  private authorizationTokens: any[];
  private bulletinBoard: any;
  private electionConfig: any;
  private emptyCryptograms: any;
  private keyPair: KeyPair;
  private voteEncryptions: any;
  private voteReceipt: any;
  private voterIdentifier: string;

  /**
   * @param bulletinBoardURL URL to the Assembly Voting backend server, specific for election.
   */
  constructor(bulletinBoardURL: string) {
    this.bulletinBoard = new BulletinBoard(bulletinBoardURL);
    this.electionConfig = {};
  }

  authorizationMethod(): { methodName: string; method: Function } {
    if (!this.electionConfig) {
      throw new Error('Please fetch election config first');
    }

    switch(this.electionConfig.authorizationMode) {
      case 'election codes':
        return {
          methodName: 'authenticateWithCodes',
          method: this.authenticateWithCodes
        }
        break;
      case 'otps':
        return {
          methodName: 'initiateDigitalReturn',
          method: this.initiateDigitalReturn
        }
        break;
      default:
        throw new Error('Authorization method not found in election config')
    }
  }

  /**
   * Authenticates or rejects voter, based on their submitted election codes.
   * @param codes Array of election code strings.
   */
  async authenticateWithCodes(codes: string[]) {
    await this.updateElectionConfig();
    const authenticationResponse = await new AuthenticateWithCodes(this.bulletinBoard)
      .authenticate(codes, this.electionId(), this.electionEncryptionKey());

    this.voterIdentifier = authenticationResponse.voterIdentifier;
    this.keyPair = authenticationResponse.keyPair;
    this.emptyCryptograms = authenticationResponse.emptyCryptograms;

    return 'Success';
  }

  /**
   * Takes PII, checks if an authorized public key already exists, and if so, returns true.
   * If not, sends it to Voter Authorization Coordinator Service, for it
   * to initiate Voter Authorizers to send out OTPs to the voter.
   * @param {string} personalIdentificationInformation We don't know what this will be yet.
   */
  async initiateDigitalReturn(personalIdentificationInformation: string) {
    if (await this.hasAuthorizedPublicKey()) {
      return 'Authorized';
    } else {
      return await this.requestOTPs(personalIdentificationInformation)
        .then((response) => 'Unauthorized');
    }
  }

  /**
   * Returns number of OTPs (one time passwords), voter should enter to authorize.
   * Number comes from election config on the bulletin board.
   * @return Promise<Number>
   */
  async getNumberOfOTPs(): Promise<number> {
    await this.updateElectionConfig();

    return this.electionConfig.OTPProviderCount;
  }

  /**
   * Takes the OTP codes.
   * Generates a new key pair.
   * Calls each OTP provider to authorize the public key by sending the according OTP code.
   */
  async finalizeAuthorization(otpCodes: string[]) {
    await this.updateElectionConfig();

    if (otpCodes.length != this.electionConfig.OTPProviderCount) {
      throw new Error('Wrong number of OTPs submitted');
    }

    const providers = this.electionConfig.OTPProviderURLs.map(
      (providerURL) => new OTPProvider(providerURL)
    );

    this.keyPair = randomKeyPair();
    const publicKey = this.publicKey();

    const requests = providers.map(function(provider, index) {
      return provider.requestOTPAuthorization(otpCodes[index], publicKey)
        .then((response) => response.data);
    });

    const tokens = await Promise.all(requests);
    if (tokens.every(validateAuthorizationToken)) {
      this.authorizationTokens = tokens;
      return 'Success';
    } else {
      return Promise.reject('Failure, not all tokens were valid');
    }
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
   * Encrypts a CVR and generates vote cryptograms.
   * CVR format is expected to be an object with `contestId` as keys and `option_handle` as values.
   * @param  cvr Object containing the selections for each contest
   * @return {String} the cryptograms fingerprint
   */
  async encryptCVR(cvr: ContestIndexed<string>) {
    await this.updateElectionConfig();

    if (JSON.stringify(Object.keys(cvr)) !== JSON.stringify(this.contestIds())) {
      throw new Error('Corrupt CVR: Contains invalid contest');
    }

    const contests = this.electionConfig.ballots
    const valid_contest_selections = Object.keys(cvr).every(function(contestId) {
      const contest = contests.find(b => b.id == contestId)
      return contest.options.some(o => o.handle == cvr[contestId])
    })
    if (!valid_contest_selections) {
      throw new Error('Corrupt CVR: Contains invalid option');
    }


    const emptyCryptograms = Object.fromEntries(Object.keys(cvr).map((contestId) => [contestId, this.emptyCryptograms[contestId].cryptogram ]))
    const contestEncodingTypes = Object.fromEntries(Object.keys(cvr).map((contestId) => {
      const contest = contests.find(b => b.id == contestId)
      return [contestId, contest.vote_encoding_type];
    }))

    const encryptionResponse = new EncryptVotes().encrypt(
      cvr,
      emptyCryptograms,
      contestEncodingTypes,
      this.electionEncryptionKey()
    );

    this.voteEncryptions = encryptionResponse

    return new EncryptVotes().fingerprint(this.cryptogramsForConfirmation());
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
    const electionId = this.electionId()
    const voteEncryptions = this.voteEncryptions
    const privateKey = this.privateKey();
    const signatureKey = this.electionSigningPublicKey();


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

  /**
   * Attempts to populate election configuration data from backend server, if it hasn't been populated yet.
   */
  private async updateElectionConfig() {
    if (Object.entries(this.electionConfig).length === 0) {
      this.electionConfig = await new ElectionConfig(this.bulletinBoard).get();
    }
  }

  /**
   * Takes PII, sends it to Voter Authorization Coordinator Service, for it
   * to initiate Voter Authorizers to send out OTPs to the voter.
   * @param {string} personalIdentificationInformation We don't know what this will be yet.
   */
  private async requestOTPs(personalIdentificationInformation: string) {
    await this.updateElectionConfig();

    const coordinatorURL = this.electionConfig.voterAuthorizationCoordinatorURL;
    const coordinator = new VoterAuthorizationCoordinator(coordinatorURL);

    return coordinator.requestOTPCodesToBeSent(personalIdentificationInformation);
  }

  private electionId() {
    return this.electionConfig.election.id;
  }

  private contestIds() {
    return this.electionConfig.ballots.map(ballot => ballot.id.toString())
  }

  private electionEncryptionKey() {
    return this.electionConfig.encryptionKey
  }

  private electionSigningPublicKey() {
    return this.electionConfig.signingPublicKey
  }

  private privateKey() {
    return this.keyPair.privateKey
  }

  private async hasAuthorizedPublicKey() {
    if (!this.keyPair) return false;
    const numberOfOTPs = await this.getNumberOfOTPs();
    return this.authorizationTokens.length == numberOfOTPs;
  }

  private publicKey() {
    return this.keyPair.publicKey
  }
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
