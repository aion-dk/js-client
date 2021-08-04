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
 * * {@link AVClient.getAuthorizationMethod | getAuthorizationMethod}
 * * {@link AVClient.ensureAuthorization | ensureAuthorization}
 * * {@link AVClient.getNumberOfOTPs | getNumberOfOTPs}
 * * {@link AVClient.finalizeAuthorization | finalizeAuthorization}
 * * {@link AVClient.encryptBallot | encryptBallot}
 * * {@link AVClient.startBenalohChallenge | startBenalohChallenge}
 * * {@link AVClient.submitEncryptedBallot | submitEncryptedBallot}
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
   *
   * @returns Returns an object with the method name, and the reference to the function.
   * Available method names are
   * * {@link AVClient.authenticateWithCodes | authenticateWithCodes} for authentication via election codes.
   * * {@link AVClient.ensureAuthorization | ensureAuthorization} for authorization via OTPs.
   */
  getAuthorizationMethod(): { methodName: string; method: Function } {
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
          methodName: 'ensureAuthorization',
          method: this.ensureAuthorization
        }
        break;
      default:
        throw new Error('Authorization method not found in election config')
    }
  }

  /**
   * Should only be used when election authorization mode is 'election codes'.
   *
   * Authenticates or rejects voter, based on their submitted election codes.
   *
   * @param codes Array of election code strings.
   * @returns Returns 'Success' if authentication succeeded.
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
   * This should be called when a voter chooses digital vote submission (instead of mail-in).
   *
   * This will send a pre-configured number of one time passwords (OTPs) to voter's email address,
   * unless the voter has already successfully finished submitting OTPs.
   *
   * This should be followed by
   * * {@link AVClient.getNumberOfOTPs | getNumberOfOTPs} to provide the required number of fields for
   * the voter to submit OTPs.
   * * {@link AVClient.finalizeAuthorization | finalizeAuthorization} to authorize with the submitted OTPs.
   *
   * @param {string} personalIdentificationInformation We don't know yet what this will be 😉.
   * @returns If voter has not yet authorized with OTPs, it will return 'Unauthorized'.<br>
   * If voter has already authorized, then returns 'Authorized'.
   */
  async ensureAuthorization(personalIdentificationInformation: string): Promise<string> {
    if (await this.hasAuthorizedPublicKey()) {
      return 'Authorized';
    } else {
      return await this.requestOTPs(personalIdentificationInformation)
        .then((response) => 'Unauthorized');
    }
  }

  /**
   * Returns number of one time passwords (OTPs) that voter should enter to authorize.
   * Number comes from election config on the bulletin board.
   *
   * @returns Number of OTPs.
   */
  async getNumberOfOTPs(): Promise<number> {
    await this.updateElectionConfig();

    return this.electionConfig.OTPProviderCount;
  }

  /**
   * This should be called after {@link AVClient.ensureAuthorization | ensureAuthorization}.
   * Takes the OTPs that voter received, uses them to authorize to submit votes.
   *
   * Internally, generates a private/public key pair, then attempts to authorize the public
   * key with each OTP provider.
   *
   * @param {string[]} An array of OTPs as strings.
   * @returns Returns 'Success' if authorization succeeded.
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
   * Encrypts a cast-vote-record (CVR) and generates vote cryptograms.
   *
   * Example:
   * ```javascript
   * const client = new AVClient(url);
   * const cvr = { '1': 'option1', '2': 'optiona' };
   * const fingerprint = await client.encryptBallot(cvr);
   * ```
   *
   * Where `'1'` and `'2'` are contest ids, and `'option1'` and `'optiona'` are
   * values internal to the AV election config. This needs further refinement 🧐.
   *
   * @param  cvr Object containing the selections for each contest.
   * @returns Returns fingerprint of the cryptograms.
   */
  async encryptBallot(cvr: CastVoteRecord): Promise<string> {
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
   * This should be called when the voter chooses to test the encryption of their ballot.
   *
   * The exact process is in development.
   *
   * @returns Returns a list of randomizers, that the digital ballot box generates.
   */
  async startBenalohChallenge(): Promise<ContestIndexed<string>> {
    return await new BenalohChallenge(this.bulletinBoard).getServerRandomizers()
  }

  /**
   * This should be the last call in the entire voting process.
   *
   * Submits encrypted ballot and the affidavit to the digital ballot box.
   *
   * @return Returns the vote receipt. Example of a receipt:
   * ```javascript
   * {
   *    previousBoardHash: 'd8d9742271592d1b212bbd4cbbbe357aef8e00cdbdf312df95e9cf9a1a921465',
   *    boardHash: '5a9175c2b3617298d78be7d0244a68f34bc8b2a37061bb4d3fdf97edc1424098',
   *    registeredAt: '2020-03-01T10:00:00.000+01:00',
   *    serverSignature: 'dbcce518142b8740a5c911f727f3c02829211a8ddfccabeb89297877e4198bc1,46826ddfccaac9ca105e39c8a2d015098479624c411b4783ca1a3600daf4e8fa',
   *    voteSubmissionId: 6
      }
   * ```
   */
  async submitEncryptedBallot(affidavit: string): Promise<Receipt> {
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
 * This is an index, with contest ids for keys, and arbitrary values that belong to matching contests.
 *
 * Example, with selected contest options:
 * ```javascript
 * { '1': 'option1', '2': 'optiona' }
 * ```
 *
 * Here `'1'` and `'2'` are contest ids, and `'option1'` and `'optiona'` are selected contest options.
 *
 * @template T Defines the data type of the value
 */
export interface ContestIndexed<T> {
  [contestId: string]: T;
}

type HashValue = string;
type BigNum = string;
type ECPoint = string;
type Cryptogram = string;
type Signature = string;
type DateTimeStamp = string;
type Proof = string;


/**
 * Example of a receipt:
 * ```javascript
 * {
 *    previousBoardHash: 'd8d9742271592d1b212bbd4cbbbe357aef8e00cdbdf312df95e9cf9a1a921465',
 *    boardHash: '5a9175c2b3617298d78be7d0244a68f34bc8b2a37061bb4d3fdf97edc1424098',
 *    registeredAt: '2020-03-01T10:00:00.000+01:00',
 *    serverSignature: 'dbcce518142b8740a5c911f727f3c02829211a8ddfccabeb89297877e4198bc1,46826ddfccaac9ca105e39c8a2d015098479624c411b4783ca1a3600daf4e8fa',
 *    voteSubmissionId: 6
    }
 * ```

 */
export type Receipt = {
  previousBoardHash: HashValue;
  boardHash: HashValue;
  registeredAt: DateTimeStamp;
  serverSignature: Signature;
};

/**
 * Example of a cvr:
 * ```javascript
 * {
 *    '1': 'option1',
 *    '2': 'optiona'
 * }
 * ```
 */
export type CastVoteRecord = ContestIndexed<string>

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
