import BulletinBoard from '../lib/av_client/connectors/bulletin_board';
import ElectionConfig from '../lib/av_client/election_config';
import AuthenticateWithCodes from '../lib/av_client/authenticate_with_codes';
import RegisterVoter from '../lib/av_client/register_voter';
import EncryptVotes from '../lib/av_client/encrypt_votes';
import BenalohChallenge from './av_client/benaloh_challenge';
import SubmitVotes from './av_client/submit_votes';
import VoterAuthorizationCoordinator from './av_client/connectors/voter_authorization_coordinator';
import OTPProvider from "./av_client/connectors/otp_provider";
import validateAuthorizationToken from "./av_client/validate_authorization_token";

/**
 * # Assembly Voting Client API.
 *
 * The API is responsible for handling all the cryptographic operations and all network communication with:
 * * the Digital Ballot Box
 * * the Voter Authorization Coordinator service
 * * the OTP provider(s)
 *
 * ### Expected sequence of methods being executed
 *
 * |Method                                                                    | Description |
 * -------------------------------------------------------------------------- | ---
 * |{@link AVClient.requestAccessCode | requestAccessCode}                   | Initiates the authorization process, in case voter has not authorized yet. Requests access code to be sent to voter email |
 * |{@link AVClient.validateAccessCode | validateAccessCode}                 | Gets voter authorized to vote. |
 * |{@link AVClient.constructBallotCryptograms | constructBallotCryptograms} | Constructs voter ballot cryptograms. |
 * |{@link AVClient.spoilBallotCryptograms | spoilBallotCryptograms}         | Optional. Initiates process of testing the ballot encryption. |
 * |{@link AVClient.submitBallotCryptograms | submitBallotCryptograms}       | Finalizes the voting process. |
 * |{@link AVClient.purgeData | purgeData}                                   | Optional. Explicitly purges internal data. |
 */

export class AVClient {
  private authorizationTokens: any[];
  private bulletinBoard: any;
  private electionConfig: any;
  private emptyCryptograms: ContestIndexed<EmptyCryptogram>;
  private keyPair: KeyPair;
  private voteEncryptions: ContestIndexed<Encryption>;
  private voterIdentifier: string;
  private succeededMethods: string[];

  /**
   * @param bulletinBoardURL URL to the Assembly Voting backend server, specific for election.
   */
  constructor(bulletinBoardURL: string) {
    this.bulletinBoard = new BulletinBoard(bulletinBoardURL);
    this.electionConfig = {};
    this.succeededMethods = [];
  }

  /**
   * Returns voter authorization mode from the election configuration.
   *
   * @internal
   * @returns Returns an object with the method name, and the reference to the function.
   * Available method names are
   * * {@link AVClient.authenticateWithCodes | authenticateWithCodes} for authentication via election codes.
   * * {@link AVClient.requestAccessCode | requestAccessCode} for authorization via OTPs.
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
          methodName: 'requestAccessCode',
          method: this.requestAccessCode
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
   * @internal
   * @param   codes Array of election code strings.
   * @returns Returns 'OK' if authentication succeeded.
   */
  async authenticateWithCodes(codes: string[]): Promise<string> {
    await this.updateElectionConfig();
    const authenticationResponse = await new AuthenticateWithCodes(this.bulletinBoard)
      .authenticate(codes, this.electionId(), this.electionEncryptionKey());

    this.voterIdentifier = authenticationResponse.voterIdentifier;
    this.keyPair = authenticationResponse.keyPair;
    this.emptyCryptograms = authenticationResponse.emptyCryptograms;

    return 'OK';
  }

  /**
   * Should be called when a voter chooses digital vote submission (instead of mail-in).
   *
   * Will attempt to get backend services to send an access code (one time password, OTP) to voter's email address.
   *
   * Should be followed by {@link AVClient.validateAccessCode | validateAccessCode} to submit access code for validation.
   *
   * @param   opaqueVoterId Voter ID that preserves voter anonymity.
   * @returns 'OK' or an error.
   */
  async requestAccessCode(opaqueVoterId: string): Promise<string> {
    await this.updateElectionConfig();

    const coordinatorURL = this.electionConfig.voterAuthorizationCoordinatorURL;
    const coordinator = new VoterAuthorizationCoordinator(coordinatorURL);

    return coordinator.createSession(opaqueVoterId).then(
      ({ data }) => {
        const sessionId = data.sessionId;
        return coordinator.startIdentification(sessionId).then(
          (response) => {
            this.succeededMethods.push('requestAccessCode');
            return 'OK';
          }
        );
      }
    );
  }

  /**
   * Returns number of one time passwords (OTPs) that voter should enter to authorize.
   * Number comes from election config on the bulletin board.
   *
   * @internal
   * @returns Number of OTPs.
   */
  async getNumberOfOTPs(): Promise<number> {
    await this.updateElectionConfig();

    return this.electionConfig.OTPProviderCount;
  }

  /**
   * Should be called after {@link AVClient.requestAccessCode | requestAccessCode}.
   *
   * Takes an access code (OTP) that voter received, uses it to authorize to submit votes.
   *
   * Internally, generates a private/public key pair, then attempts to authorize the public
   * key with each OTP provider.
   *
   * Should be followed by {@link AVClient.constructBallotCryptograms | constructBallotCryptograms}.
   *
   * @param   code An access code string.
   * @param   email Voter email.
   * @returns Returns `'OK'` if authorization succeeded.
   */
  async validateAccessCode(code: (string|string[]), email: string): Promise<string> {
    this.validateCallOrder('validateAccessCode');
    await this.updateElectionConfig();

    let otpCodes;

    if (typeof code === 'string') {
      otpCodes = [code];
    } else {
      otpCodes = code;
    }

    if (otpCodes.length != this.electionConfig.OTPProviderCount) {
      throw new Error('Wrong number of OTPs submitted');
    }

    const providers = this.electionConfig.OTPProviderURLs.map(
      (providerURL) => new OTPProvider(providerURL)
    );

    const requests = providers.map(function(provider, index) {
      return provider.requestOTPAuthorization(otpCodes[index], email)
        .then((response) => response.data);
    });

    const tokens = await Promise.all(requests);
    if (tokens.every(validateAuthorizationToken)) {
      this.authorizationTokens = tokens;
      await new RegisterVoter(this).call();
      this.succeededMethods.push('validateAccessCode');
      return 'OK';
    } else {
      return Promise.reject('Failure, not all tokens were valid');
    }
  }

  /**
   * Should be called after {@link AVClient.validateAccessCode | validateAccessCode}.
   *
   * Encrypts a cast-vote-record (CVR) and generates vote cryptograms.
   *
   * Example:
   * ```javascript
   * const client = new AVClient(url);
   * const cvr = { '1': 'option1', '2': 'optiona' };
   * const fingerprint = await client.constructBallotCryptograms(cvr);
   * ```
   *
   * Where `'1'` and `'2'` are contest ids, and `'option1'` and `'optiona'` are
   * values internal to the AV election config.
   *
   * Should be followed by either {@link AVClient.spoilBallotCryptograms | spoilBallotCryptograms}
   * or {@link AVClient.submitBallotCryptograms | submitBallotCryptograms}.
   *
   * @param   cvr Object containing the selections for each contest.<br>TODO: needs better specification.
   * @returns Returns fingerprint of the cryptograms. Example:
   * ```javascript
   * '5e4d8fe41fa3819cc064e2ace0eda8a847fe322594a6fd5a9a51c699e63804b7'
   * ```
   */
  async constructBallotCryptograms(cvr: CastVoteRecord): Promise<string> {
    this.validateCallOrder('constructBallotCryptograms');
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

    const fingerprint = new EncryptVotes().fingerprint(this.cryptogramsForConfirmation());
    this.succeededMethods.push('constructBallotCryptograms');

    return fingerprint;
  }

  /**
   * Should be called when voter chooses to test the encryption of their ballot.
   *
   * TODO: exact process needs specification.
   *
   * @returns Returns an index, where keys are contest ids, and values are randomizers, that the digital ballot box generates. Example:
   * ```javascript
   * {
   *   '1': '12131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f3031',
   *   '2': '1415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f30313233'
   * }
   * ```
   */
  async spoilBallotCryptograms(): Promise<ContestIndexed<string>> {
    this.validateCallOrder('spoilBallotCryptograms');
    const randomizers = await new BenalohChallenge(this.bulletinBoard).getServerRandomizers();
    this.succeededMethods.push('spoilBallotCryptograms');
    return randomizers;
  }

  /**
   * Should be the last call in the entire voting process.
   *
   * Submits encrypted ballot and the affidavit to the digital ballot box.

   *
   *
   * @param  affidavit The affidavit document.<br>TODO: clarification of the affidavit format is still needed.
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
  async submitBallotCryptograms(affidavit: Affidavit): Promise<Receipt> {
    this.validateCallOrder('submitBallotCryptograms');
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
   * Purges internal data.
   */
  purgeData(): void {
    // TODO: implement me
    return
  }

  /**
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
   * Attempts to populate election configuration data from backend server, if it hasn't been populated yet.
   */
  private async updateElectionConfig() {
    if (Object.entries(this.electionConfig).length === 0) {
      this.electionConfig = await new ElectionConfig(this.bulletinBoard).get();
    }
  }

  private electionId(): number {
    return this.electionConfig.election.id;
  }

  private contestIds(): string[] {
    return this.electionConfig.ballots.map(ballot => ballot.id.toString())
  }

  private electionEncryptionKey(): ECPoint {
    return this.electionConfig.encryptionKey
  }

  private electionSigningPublicKey(): ECPoint {
    return this.electionConfig.signingPublicKey
  }

  private privateKey(): BigNum {
    return this.keyPair.privateKey
  }

  private publicKey(): ECPoint {
    return this.keyPair.publicKey
  }

  private async hasAuthorizedPublicKey(): Promise<boolean> {
    if (!this.keyPair) return false;
    const numberOfOTPs = await this.getNumberOfOTPs();
    return this.authorizationTokens.length == numberOfOTPs;
  }

  private validateCallOrder(methodName) {
    const expectations = {
      validateAccessCode: ['requestAccessCode'],
      constructBallotCryptograms: ['requestAccessCode', 'validateAccessCode'],
      spoilBallotCryptograms: ['requestAccessCode', 'validateAccessCode', 'constructBallotCryptograms'],
      submitBallotCryptograms: ['requestAccessCode', 'validateAccessCode', 'constructBallotCryptograms'],
    };

    const requiredCalls = expectations[methodName];

    if (requiredCalls === undefined) {
      throw new Error(`Call order validation for method #${methodName} is not implemented`)
    } else {
      if (JSON.stringify(this.succeededMethods) != JSON.stringify(requiredCalls)) {
        const requiredList = requiredCalls.map((name) => `#${name}`).join(', ');
        const gotList = this.succeededMethods.map((name) => `#${name}`).join(', ');
        throw new CallOutOfOrderError(`#${methodName} requires exactly ${requiredList} to be called before it`);
      }
    }
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
 * }
 * ```
 */
export type Receipt = {
  previousBoardHash: string;
  boardHash: string;
  registeredAt: string;
  serverSignature: string;
  voteSubmissionId: number;
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

/**
 * For now, we assume it is just a string.
 */
export type Affidavit = string;

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

class CallOutOfOrderError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CallOutOfOrderError.prototype);
    this.name = 'CallOutOfOrderError';
  }
}
