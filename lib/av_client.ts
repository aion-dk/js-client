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
 * Expected sequence of methods being executed, when authorization happens through OTPs:
 * * {@link AVClient.authorizationMethod | authorizationMethod}
 * * {@link AVClient.initiateDigitalReturn | initiateDigitalReturn}
 * * {@link AVClient.getNumberOfOTPs | getNumberOfOTPs}
 * * {@link AVClient.finalizeAuthorization | finalizeAuthorization}
 * * {@link AVClient.encryptCVR | encryptCVR}
 * * {@link AVClient.startBenalohChallenge | startBenalohChallenge}
 * * {@link AVClient.signAndSubmitEncryptedVotes | signAndSubmitEncryptedVotes}
 */

export class AVClient {
  /** @internal */
  private authorizationTokens: any[];
  /** @internal */
  private bulletinBoard: any;
  /** @internal */
  private electionConfig: any;
  /** @internal */
  private emptyCryptograms: ContestIndexed<EmptyCryptogram>;
  /** @internal */
  private keyPair: KeyPair;
  /** @internal */
  private voteEncryptions: ContestIndexed<Encryption>;
  /** @internal */
  private voterIdentifier: string;

  /**
   * @param bulletinBoardURL URL to the Assembly Voting backend server, specific for election.
   */
  constructor(bulletinBoardURL: string) {
    this.bulletinBoard = new BulletinBoard(bulletinBoardURL);
    this.electionConfig = {};
  }

  /**
   * Returns voter authorization mode from the election configuration.
   */
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
   * Should only be used when election authorization mode is 'election codes'.
   * Authenticates or rejects voter, based on their submitted election codes.
   * @param codes Array of election code strings.
   */
  async authenticateWithCodes(codes: string[]): Promise<string> {
    await this.updateElectionConfig();
    const authenticationResponse = await new AuthenticateWithCodes(this.bulletinBoard)
      .authenticate(codes, this.electionId(), this.electionEncryptionKey());

    this.voterIdentifier = authenticationResponse.voterIdentifier;
    this.keyPair = authenticationResponse.keyPair;
    this.emptyCryptograms = authenticationResponse.emptyCryptograms;

    return 'Success';
  }

  /**
   * Takes PII, checks if an authorized public key already exists, and if so, returns 'Authorized'.
   * If not, sends it to Voter Authorization Coordinator Service, for it
   * to initiate Voter Authorizers to send out OTPs to the voter, and returns 'Unauthorized'.
   * @param {string} personalIdentificationInformation We don't know what this will be yet.
   */
  async initiateDigitalReturn(personalIdentificationInformation: string): Promise<string> {
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
   * TODO: make command methods return void, instead of 'Success' strings
   * Calls each OTP provider to authorize the public key by sending the according OTP code.
   */
  async finalizeAuthorization(otpCodes: string[]): Promise<string> {
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
   * Encrypts a CVR and generates vote cryptograms.
   * CVR format is expected to be an object with `contestId` as keys and `option_handle` as values.
   * TODO: add an example of argument.
   * @param  cvr Object containing the selections for each contest
   * @return {String} the cryptograms fingerprint
   */
  async encryptCVR(cvr: ContestIndexed<string>): Promise<HashValue> {
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

  /**
   * TODO: write the description
   */
  async startBenalohChallenge(): Promise<ContestIndexed<BigNum>> {
    return await new BenalohChallenge(this.bulletinBoard).getServerRandomizers()
  }

  /**
   * Prepares the vote submission package.
   * Submits encrypted voter ballot choices to the digital ballot box.
   * @return {Promise} Returns the vote receipt as a promise.
   */
  async signAndSubmitEncryptedVotes(affidavit: string): Promise<Receipt> {
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
        signatureKey,
        affidavit
    });
  }

  /**
   * @internal
   * Returns data for rendering the list of cryptograms of the ballot
   * @return Object containing a cryptogram for each contest
   */
  private cryptogramsForConfirmation(): ContestIndexed<Cryptogram> {
    const cryptograms = {}
    const voteEncryptions = this.voteEncryptions
    this.contestIds().forEach(function (id) {
      cryptograms[id] = voteEncryptions[id].cryptogram
    })

    return cryptograms
  }

  /**
   * @internal
   * Attempts to populate election configuration data from backend server, if it hasn't been populated yet.
   */
  private async updateElectionConfig() {
    if (Object.entries(this.electionConfig).length === 0) {
      this.electionConfig = await new ElectionConfig(this.bulletinBoard).get();
    }
  }

  /**
   * @internal
   * Takes PII, sends it to Voter Authorization Coordinator Service, for it
   * to initiate Voter Authorizers to send out OTPs to the voter.
   * @param {string} personalIdentificationInformation We don't know what this will be yet.
   */
  private async requestOTPs(personalIdentificationInformation: string): Promise<any> {
    await this.updateElectionConfig();

    const coordinatorURL = this.electionConfig.voterAuthorizationCoordinatorURL;
    const coordinator = new VoterAuthorizationCoordinator(coordinatorURL);

    return coordinator.requestOTPCodesToBeSent(personalIdentificationInformation);
  }

  /** @internal */
  private electionId(): number {
    return this.electionConfig.election.id;
  }

  /** @internal */
  private contestIds(): string[] {
    return this.electionConfig.ballots.map(ballot => ballot.id.toString())
  }

  /** @internal */
  private electionEncryptionKey(): ECPoint {
    return this.electionConfig.encryptionKey
  }

  /** @internal */
  private electionSigningPublicKey(): ECPoint {
    return this.electionConfig.signingPublicKey
  }

  /** @internal */
  private privateKey(): BigNum {
    return this.keyPair.privateKey
  }

  /** @internal */
  private publicKey(): ECPoint {
    return this.keyPair.publicKey
  }

  /** @internal */
  private async hasAuthorizedPublicKey(): Promise<boolean> {
    if (!this.keyPair) return false;
    const numberOfOTPs = await this.getNumberOfOTPs();
    return this.authorizationTokens.length == numberOfOTPs;
  }
}

/**
 * Used for structuring data that is indexed under contests
 * TODO: add a literal example of this structure
 * @template Type defines the data type
 */
export interface ContestIndexed<Type> {
  /** The contest 'id' **/
  [index: string]: Type;
}

type HashValue = string;
type BigNum = string;
type ECPoint = string;
type Cryptogram = string;
type Signature = string;
type DateTimeStamp = string;
type Proof = string;

/**
 * We need to discuss what's this going to be.
 */
export type Receipt = {
  previousBoardHash: HashValue;
  boardHash: HashValue;
  registeredAt: DateTimeStamp;
  serverSignature: Signature;
};
type KeyPair = {
  privateKey: BigNum;
  publicKey: ECPoint;
};
type Encryption = {
  cryptogram: Cryptogram;
  randomness: BigNum;
  proof: Proof;
}
type EmptyCryptogram = {
  cryptogram: Cryptogram;
  commitment: ECPoint;
}
