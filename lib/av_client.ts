import { BulletinBoard } from '../lib/av_client/connectors/bulletin_board';
import { fetchElectionConfig, ElectionConfig } from '../lib/av_client/election_config';
import { ContestIndexed, OpenableEnvelope, EmptyCryptogram } from './av_client/types'
import AuthenticateWithCodes from '../lib/av_client/authenticate_with_codes';
import { registerVoter } from '../lib/av_client/register_voter';
import EncryptVotes from '../lib/av_client/encrypt_votes';
import BenalohChallenge from './av_client/benaloh_challenge';
import SubmitVotes from './av_client/submit_votes';
import VoterAuthorizationCoordinator from './av_client/connectors/voter_authorization_coordinator';
import { OTPProvider, IdentityConfirmationToken } from "./av_client/connectors/otp_provider";
import { InvalidConfigError, InvalidStateError } from './av_client/errors'

/**
 * # Assembly Voting Client API.
 *
 * The API is responsible for handling all the cryptographic operations and all network communication with:
 * * the Digital Ballot Box
 * * the Voter Authorization Coordinator service
 * * the OTP provider(s)
 *
 * ## Expected sequence of methods being executed
 *
 * |Method                                                                    | Description |
 * -------------------------------------------------------------------------- | ---
 * |{@link AVClient.requestAccessCode | requestAccessCode}                   | Initiates the authorization process, in case voter has not authorized yet. Requests access code to be sent to voter email |
 * |{@link AVClient.validateAccessCode | validateAccessCode}                 | Gets voter authorized to vote. |
 * |{@link AVClient.constructBallotCryptograms | constructBallotCryptograms} | Constructs voter ballot cryptograms. |
 * |{@link AVClient.spoilBallotCryptograms | spoilBallotCryptograms}         | Optional. Initiates process of testing the ballot encryption. |
 * |{@link AVClient.submitBallotCryptograms | submitBallotCryptograms}       | Finalizes the voting process. |
 * |{@link AVClient.purgeData | purgeData}                                   | Optional. Explicitly purges internal data. |
 *
 * ## Example walkthrough test
 *
 * ```typescript
 * [[include:readme_example.test.ts]]
 * ```
 */

export class AVClient {
  private authorizationSessionId: string;
  private email: string;
  private identityConfirmationToken: IdentityConfirmationToken;

  private bulletinBoard: BulletinBoard;
  private electionConfig?: ElectionConfig;
  private emptyCryptograms: ContestIndexed<EmptyCryptogram>;
  private keyPair: KeyPair;
  private testCode: string;
  private voteEncryptions: ContestIndexed<OpenableEnvelope>;
  private voterIdentifier: string;
  private succeededMethods: string[];
  private contestIds: number[];

  /**
   * @param bulletinBoardURL URL to the Assembly Voting backend server, specific for election.
   */
  constructor(bulletinBoardURL: string) {
    this.bulletinBoard = new BulletinBoard(bulletinBoardURL);
    this.succeededMethods = [];
  }

  /**
   * Initializes the client with an election config.
   * If no config is provided, it fetches one from the backend.
   *
   * @param electionConfig override election config object
   * @returns Returns undefined if succeeded or throws an error
   * @throws NetworkError if any request failed to get a response
   */
  async initialize(electionConfig: ElectionConfig): Promise<void>
  async initialize(): Promise<void>
  async initialize(electionConfig?: ElectionConfig): Promise<void> {
    if( electionConfig )
      this.electionConfig = electionConfig
    else
      this.electionConfig = await fetchElectionConfig(this.bulletinBoard);
  }

  /**
   * Returns voter authorization mode from the election configuration.
   *
   * @internal
   * @returns Returns an object with the method name, and the reference to the function.
   * Available method names are
   * * {@link AVClient.authenticateWithCodes | authenticateWithCodes} for authentication via election codes.
   * * {@link AVClient.requestAccessCode | requestAccessCode} for authorization via OTPs.
   * @throws InvalidConfigError if the config does not specify a supported authorizationMode
   */
  getAuthorizationMethod(): { methodName: string; method: Function } {
    switch(this.getElectionConfig().authorizationMode) {
      case 'election codes':
        return {
          methodName: 'authenticateWithCodes',
          method: this.authenticateWithCodes
        }
      case 'otps':
        return {
          methodName: 'requestAccessCode',
          method: this.requestAccessCode
        }
      default:
        throw new InvalidConfigError('Authorization method not found in election config')
    }
  }

  /**
   * Should only be used when election authorization mode is 'election codes'.
   *
   * Authenticates or rejects voter, based on their submitted election codes.
   *
   * @internal
   * @param   codes Array of election code strings.
   * @returns Returns undefined if authentication succeeded or throws an error
   */
  async authenticateWithCodes(codes: string[]): Promise<void> {
    const authenticationResponse = await new AuthenticateWithCodes(this.bulletinBoard)
      .authenticate(codes, this.electionId(), this.electionEncryptionKey());

    this.voterIdentifier = authenticationResponse.voterIdentifier;
    this.keyPair = authenticationResponse.keyPair;
    this.emptyCryptograms = authenticationResponse.emptyCryptograms;

    return Promise.resolve();
  }

  /**
   * Should be called when a voter chooses digital vote submission (instead of mail-in).
   *
   * Will attempt to get backend services to send an access code (one time password, OTP) to voter's email address.
   *
   * Should be followed by {@link AVClient.validateAccessCode | validateAccessCode} to submit access code for validation.
   *
   * @param opaqueVoterId Voter ID that preserves voter anonymity.
   * @param email where the voter expects to receive otp code.
   * @returns Returns undefined or throws an error.
   * @throws VoterRecordNotFound if no voter was found
   * @throws NetworkError if any request failed to get a response
   */
  async requestAccessCode(opaqueVoterId: string, email: string): Promise<void> {
    const coordinatorURL = this.getElectionConfig().voterAuthorizationCoordinatorURL;
    const coordinator = new VoterAuthorizationCoordinator(coordinatorURL);

    return coordinator.createSession(opaqueVoterId, email)
      .then(({ data: { sessionId } }) => {
        return sessionId
      })
      .then(async sessionId => {
        this.authorizationSessionId = sessionId
        this.email = email
        this.succeededMethods.push('requestAccessCode');

        await coordinator.startIdentification(sessionId);
      });
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
   * @returns Returns undefined if authorization succeeded or throws an error
   * @throws InvalidStateError if called before required data is available
   * @throws AccessCodeExpired if an OTP code has expired
   * @throws AccessCodeInvalid if an OTP code is invalid
   * @throws NetworkError if any request failed to get a response
   */
  async validateAccessCode(code: string): Promise<void> {
    if(!this.email)
      throw new InvalidStateError('Cannot validate access code. Access code was not requested.');

    const provider = new OTPProvider(this.getElectionConfig().OTPProviderURL)
    
    this.identityConfirmationToken = await provider.requestOTPAuthorization(code, this.email)

    this.succeededMethods.push('validateAccessCode');

    return Promise.resolve()
  }


  /**
   * Registers a voter
   *
   * @returns undefined or throws an error
   */
  async registerVoter(): Promise<void> {
    if(!this.identityConfirmationToken)
      throw new InvalidStateError('Cannot register voter without identity confirmation. User has not validated access code.')

    // FIXME this needs to be generated
    this.keyPair = {
      privateKey: '70d161fe8546c88b719c3e511d113a864013cda166f289ff6de9aba3eb4e8a4d',
      publicKey: '039490ed35e0cabb39592792d69b5d4bf2104f20df8c4bbf36ee6b705595e776d2'
    }

    const coordinatorURL = this.getElectionConfig().voterAuthorizationCoordinatorURL;
    const coordinator = new VoterAuthorizationCoordinator(coordinatorURL);

    const authrorizationResponse = await coordinator.requestPublicKeyAuthorization(this.authorizationSessionId, this.identityConfirmationToken, this.keyPair.publicKey)
    const { authorizationToken } = authrorizationResponse.data

    const registerVoterResponse = await registerVoter(this.bulletinBoard, this.keyPair, this.getElectionConfig().encryptionKey, authorizationToken)

    this.voterIdentifier = registerVoterResponse.voterIdentifier
    this.emptyCryptograms = registerVoterResponse.emptyCryptograms
    this.contestIds = registerVoterResponse.contestIds

    return Promise.resolve()
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
   * const trackingCode = await client.constructBallotCryptograms(cvr);
   * ```
   *
   * Where `'1'` and `'2'` are contest ids, and `'option1'` and `'optiona'` are
   * values internal to the AV election config.
   *
   * Should be followed by either {@link AVClient.spoilBallotCryptograms | spoilBallotCryptograms}
   * or {@link AVClient.submitBallotCryptograms | submitBallotCryptograms}.
   *
   * @param   cvr Object containing the selections for each contest.<br>TODO: needs better specification.
   * @returns Returns the ballot tracking code. Example:
   * ```javascript
   * '5e4d8fe41fa3819cc064e2ace0eda8a847fe322594a6fd5a9a51c699e63804b7'
   * ```
   * @throws InvalidStateError if called before required data is available
   * @throws CorruptCVRError if the cast vote record is invalid
   * @throws NetworkError if any request failed to get a response
   */
  async constructBallotCryptograms(cvr: CastVoteRecord): Promise<string> {
    if(!(this.voterIdentifier || this.emptyCryptograms || this.contestIds)) {
      throw new InvalidStateError('Cannot construct ballot cryptograms. Voter registration not completed successfully')
    }

    if (JSON.stringify(Object.keys(cvr).map(k => parseInt(k))) !== JSON.stringify(this.contestIds)) {
      throw new Error('Corrupt CVR: Contains invalid contest');
    }

    const contests = this.getElectionConfig().ballots
    const valid_contest_selections = Object.keys(cvr).every(function(contestId) {
      const contest = contests.find(b => b.id.toString() == contestId)
      return contest && contest.options.some(o => o.handle == cvr[contestId])
    })
    if (!valid_contest_selections) {
      throw new Error('Corrupt CVR: Contains invalid option');
    }

    const emptyCryptograms = Object.fromEntries(Object.keys(cvr).map((contestId) => [contestId, this.emptyCryptograms[contestId].empty_cryptogram ]))
    const contestEncodingTypes = Object.fromEntries(Object.keys(cvr).map((contestId) => {
      const contest = contests.find(b => b.id.toString() == contestId)
      // We can use non-null assertion for contest because selections have been validated
      return [contestId, contest!.vote_encoding_type];
    }))

    const encryptionResponse = new EncryptVotes().encrypt(
      cvr,
      emptyCryptograms,
      contestEncodingTypes,
      this.electionEncryptionKey()
    );

    this.voteEncryptions = encryptionResponse

    const trackingCode = new EncryptVotes().fingerprint(this.cryptogramsForConfirmation());
    this.succeededMethods.push('constructBallotCryptograms');

    return trackingCode;
  }

  /**
   * Should be called after {@link AVClient.validateAccessCode | validateAccessCode}.
   * Should be called before {@link AVClient.spoilBallotCryptograms | spoilBallotCryptograms}.
   *
   * Generates an encryption key that is used to add another encryption layer to vote cryptograms when they are spoiled.
   *
   * The generateTestCode is used in case {@link AVClient.spoilBallotCryptograms | spoilBallotCryptograms} is called afterwards.
   *
   * @returns Returns the test code. Example:
   * ```javascript
   * '5e4d8fe41fa3819cc064e2ace0eda8a847fe322594a6fd5a9a51c699e63804b7'
   * ```
   */
  generateTestCode() {
    const testCode = new EncryptVotes().generateTestCode()

    this.testCode = testCode
  }

  /**
   * Should be called when voter chooses to test the encryption of their ballot.
   * Gets commitment opening of the digital ballot box and validates it.
   *
   * @returns Returns undefined if the validation succeeds or throws an error
   * @throws InvalidStateError if called before required data is available
   * @throws ServerCommitmentError if the server commitment is invalid
   * @throws NetworkError if any request failed to get a response
   */
  async spoilBallotCryptograms(): Promise<void> {
    //this.validateCallOrder('spoilBallotCryptograms');
    // TODO: encrypt the vote cryptograms one more time with a key derived from `this.generateTestCode`.
    //  A key is derived like: key = hash(test code, ballot id, cryptogram index)
    // TODO: compute commitment openings of the voter commitment
    // TODO: call the bulletin board to spoil the cryptograms. Send the encrypted vote cryptograms and voter commitment
    //  opening. Response contains server commitment openings.
    // TODO: verify the server commitment openings against server commitment and server empty cryptograms

    const benaloh = new BenalohChallenge(this.bulletinBoard)

    // this is part of 'offline Benaloh Challenge'
    // const serverRandomizers = await benaloh.getServerRandomizers()

    const voterCommitmentOpening = {};
    const encryptedBallotCryptograms = {};
    const serverCommitment = ''; // get this from the state
    const serverEmptyCryptograms = {}; // get this from the state
    const serverCommitmentOpening = await benaloh.getServerCommitmentOpening(voterCommitmentOpening, encryptedBallotCryptograms)
    const valid = benaloh.verifyCommitmentOpening(serverCommitmentOpening, serverCommitment, serverEmptyCryptograms)

    if (valid) {
      this.succeededMethods.push('spoilBallotCryptograms');
      return Promise.resolve()
    } else {
      return Promise.reject('Server commitment did not validate')
    }
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
   * @throws NetworkError if any request failed to get a response
   */
  async submitBallotCryptograms(affidavit: Affidavit): Promise<Receipt> {
    if(!(this.voterIdentifier || this.voteEncryptions)) {
      throw new InvalidStateError('Cannot submit cryptograms. Voter identity unknown or no open envelopes')
    }

    const voterIdentifier = this.voterIdentifier
    const electionId = this.electionId()
    const encryptedVotes = this.voteEncryptions
    const voterPrivateKey = this.privateKey();
    const electionSigningPublicKey = this.electionSigningPublicKey();

    return await new SubmitVotes(this.bulletinBoard)
      .signAndSubmitVotes({
        voterIdentifier,
        electionId,
        encryptedVotes,
        voterPrivateKey,
        electionSigningPublicKey,
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
    this.contestIds.forEach(function (id) {
      cryptograms[id.toString()] = voteEncryptions[id].cryptogram
    })

    return cryptograms
  }


  public getElectionConfig(): ElectionConfig {
    if(!this.electionConfig){
      throw new InvalidStateError('No configuration loaded. Did you call initialize()?')
    }

    return this.electionConfig
  }

  private electionId(): number {
    return this.getElectionConfig().election.id;
  }

  private electionEncryptionKey(): ECPoint {
    return this.getElectionConfig().encryptionKey
  }

  private electionSigningPublicKey(): ECPoint {
    return this.getElectionConfig().signingPublicKey
  }

  private privateKey(): BigNum {
    return this.keyPair.privateKey
  }

  private publicKey(): ECPoint {
    return this.keyPair.publicKey
  }

  private validateCallOrder(methodName) {
    const expectations = {
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
        throw new InvalidStateError(`#${methodName} requires exactly ${requiredList} to be called before it`);
      }
    }
  }
}

type BigNum = string;
type ECPoint = string;
type Cryptogram = string;
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