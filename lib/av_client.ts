import { BulletinBoard } from './av_client/connectors/bulletin_board';
import { fetchElectionConfig, ElectionConfig, validateElectionConfig } from './av_client/election_config';
import { registerVoter } from './av_client/register_voter';
import EncryptVotes from './av_client/encrypt_votes';
import SubmitVotes from './av_client/submit_votes';
import VoterAuthorizationCoordinator from './av_client/connectors/voter_authorization_coordinator';
import { OTPProvider, IdentityConfirmationToken } from "./av_client/connectors/otp_provider";
import * as NistConverter from './util/nist_converter';

import {
  IAVClient,
  ContestMap,
  OpenableEnvelope,
  EmptyCryptogram,
  BallotBoxReceipt,
  Ballot,
  VoterSessionItem,
  HashValue,
  Signature,
} from './av_client/types';

import {
  AvClientError,
  AccessCodeExpired,
  AccessCodeInvalid,
  BulletinBoardError,
  CorruptCvrError,
  EmailDoesNotMatchVoterRecordError,
  InvalidConfigError,
  InvalidStateError,
  NetworkError } from './av_client/errors';

import { KeyPair, CastVoteRecord, Affidavit } from './av_client/types';
import { validateCvr } from './av_client/cvr_validation';
import { randomKeyPair} from './av_client/generate_key_pair';

import * as sjclLib from './av_client/sjcl';
import { generatePedersenCommitment } from './av_client/crypto/pedersen_commitment';
import { checkEligibility } from './av_client/eligibility_check';

/** @internal */
export const sjcl = sjclLib;

/**
 * # Assembly Voting Client API
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
 * |{@link AVClient.initialize | initialize }                                 | Initializes the library by fetching election configuration |
 * |{@link AVClient.requestAccessCode | requestAccessCode }                   | Initiates the authorization process, in case voter has not authorized yet. Requests access code to be sent to voter email |
 * |{@link AVClient.validateAccessCode | validateAccessCode }                 | Gets voter authorized to vote. |
 * |{@link AVClient.registerVoter | registerVoter }                           | Registers the voter on the bulletin board |
 * |{@link AVClient.constructBallotCryptograms | constructBallotCryptograms } | Constructs voter ballot cryptograms. |
 * |{@link AVClient.spoilBallotCryptograms | spoilBallotCryptograms }         | Optional. Initiates process of testing the ballot encryption. |
 * |{@link AVClient.submitBallotCryptograms | submitBallotCryptograms }       | Finalizes the voting process. |
 * |{@link AVClient.purgeData | purgeData }                                   | Optional. Explicitly purges internal data. |
 *
 * ## Example walkthrough test
 *
 * ```typescript
 * [[include:readme_example.test.ts]]
 * ```
 */

export class AVClient implements IAVClient {
  private authorizationSessionId: string;
  private email: string;
  private identityConfirmationToken: IdentityConfirmationToken;

  private bulletinBoard: BulletinBoard;
  private electionConfig?: ElectionConfig;
  private emptyCryptograms: ContestMap<EmptyCryptogram>;
  private keyPair: KeyPair;

  private voteEncryptions: ContestMap<OpenableEnvelope>;
  //private voterIdentifier: string;
  private voterSession: VoterSessionItem;
  private contestIds: number[];

  /**
   * @param bulletinBoardURL URL to the Assembly Voting backend server, specific for election.
   */
  constructor(bulletinBoardURL: string) {
    this.bulletinBoard = new BulletinBoard(bulletinBoardURL);
  }

  /**
   * Initializes the client with an election config.
   * If no config is provided, it fetches one from the backend.
   *
   * @param electionConfig Allows injection of an election configuration for testing purposes
   * @returns Returns undefined if succeeded or throws an error
   * @throws {@link NetworkError | NetworkError } if any request failed to get a response
   */
  async initialize(electionConfig: ElectionConfig): Promise<void>
  async initialize(): Promise<void>
  public async initialize(electionConfig?: ElectionConfig): Promise<void> {
    if (!electionConfig) {
      electionConfig = await fetchElectionConfig(this.bulletinBoard);
    }

    validateElectionConfig(electionConfig);
    this.electionConfig = electionConfig;
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
   * @throws {@link NetworkError | NetworkError } if any request failed to get a response
   */
  public async requestAccessCode(opaqueVoterId: string, email: string): Promise<void> {
    const coordinatorURL = this.getElectionConfig().services.voter_authorizer.url;
    const voterAuthorizerContextUuid = this.getElectionConfig().services.voter_authorizer.election_context_uuid;
    const coordinator = new VoterAuthorizationCoordinator(coordinatorURL, voterAuthorizerContextUuid);

    return coordinator.createSession(opaqueVoterId, email)
      .then(({ data: { sessionId } }) => {
        return sessionId
      })
      .then(async sessionId => {
        this.authorizationSessionId = sessionId
        this.email = email
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
   * @throws {@link InvalidStateError | InvalidStateError } if called before required data is available
   * @throws {@link AccessCodeExpired | AccessCodeExpired } if an OTP code has expired
   * @throws {@link AccessCodeInvalid | AccessCodeInvalid } if an OTP code is invalid
   * @throws {@link NetworkError | NetworkError } if any request failed to get a response
   */
  async validateAccessCode(code: string): Promise<void> {
    if(!this.email)
      throw new InvalidStateError('Cannot validate access code. Access code was not requested.');

    const otpProviderUrl = this.getElectionConfig().services.otp_provider.url;
    const otpProviderElectionContextUuid = this.getElectionConfig().services.otp_provider.election_context_uuid;
    const provider = new OTPProvider(otpProviderUrl, otpProviderElectionContextUuid)

    this.identityConfirmationToken = await provider.requestOTPAuthorization(code, this.email);
  }

  /**
   * Compatible with new DBB structure
   * (WIP)
   */
  public async createVoterRegistration(): Promise<void> {
    if(!this.identityConfirmationToken)
      throw new InvalidStateError('Cannot register voter without identity confirmation. User has not validated access code.')

    this.keyPair = randomKeyPair();

    const coordinatorURL = this.getElectionConfig().services.voter_authorizer.url;
    const voterAuthorizerContextUuid = this.getElectionConfig().services.voter_authorizer.election_context_uuid;
    const coordinator = new VoterAuthorizationCoordinator(coordinatorURL, voterAuthorizerContextUuid);
    const servicesBoardAddress = this.getElectionConfig().services.address

    const authorizationResponse = await coordinator.requestPublicKeyAuthorization(
      this.authorizationSessionId,
      this.identityConfirmationToken,
      this.keyPair.publicKey
    )

    const { authToken } = authorizationResponse.data

    const voterSessionItem = await this.bulletinBoard.createVoterRegistration(authToken, servicesBoardAddress);

    this.voterSession = voterSessionItem;
  }

  /**
   * Registers a voter
   * @returns undefined or throws an error
   */
  public async registerVoter(): Promise<void> {
    return this.createVoterRegistration();
  }

  /**
   * Should be called after {@link AVClient.validateAccessCode | validateAccessCode}.
   *
   * Encrypts a {@link CastVoteRecord | cast-vote-record} (CVR) and generates vote cryptograms.
   *
   * Example:
   * ```javascript
   * const client = new AVClient(url);
   * const cvr = { '1': 'option1', '2': 'optiona' };
   * const trackingCode = await client.constructBallotCryptograms(cvr);
   * ```
   *
   * Example of handling errors:
   * ```
   * try {
   *   await client.constructBallotCryptograms({});
   * } catch(error) {
   *   if(error instanceof AvClientError) {
   *     switch(error.name) {
   *       case 'InvalidStateError':
   *         console.log("State is not valid for this call");
   *         break;
   *       case 'NetworkError':
   *         console.log("It's a network error");
   *         break;
   *       default:
   *         console.log('Something else was wrong');
   *      }
   *   }
   * }
   * ```
   *
   * Where `'1'` and `'2'` are contest ids, and `'option1'` and `'optiona'` are
   * values internal to the AV election config.
   *
   * Should be followed by either {@link AVClient.spoilBallotCryptograms | spoilBallotCryptograms}
   * or {@link AVClient.submitBallotCryptograms | submitBallotCryptograms}.
   *
   * @param   cvr Object containing the selections for each contest.
   * @returns Returns the ballot tracking code. Example:
   * ```javascript
   * '5e4d8fe41fa3819cc064e2ace0eda8a847fe322594a6fd5a9a51c699e63804b7'
   * ```
   * @throws {@link InvalidStateError | InvalidStateError } if called before required data is available
   * @throws {@link CorruptCvrError | CorruptCvrError } if the cast vote record is invalid
   * @throws {@link NetworkError | NetworkError } if any request failed to get a response
   */
  public async constructBallotCryptograms(cvr: CastVoteRecord): Promise<string> {
    if(!this.voterSession) {
      throw new InvalidStateError('Cannot construct ballot cryptograms. Voter registration not completed successfully')
    }

    const { voterGroup } = this.voterSession.content;

    const { contestConfigs, ballotConfigs, thresholdConfig } = this.getElectionConfig();

    switch(checkEligibility(voterGroup, cvr, ballotConfigs)) {
      case ":not_eligible":  throw new CorruptCvrError('Corrupt CVR: Not eligible');
      case ":okay":
    }

    switch(validateCvr(cvr, contestConfigs)) {
      case ":invalid_contest": throw new CorruptCvrError('Corrupt CVR: Contains invalid contest');
      case ":invalid_option": throw new CorruptCvrError('Corrupt CVR: Contains invalid option');
      case ":okay":
    }

    const DEFAULT_MARKING_TYPE = {
      style: "regular",
      handleSize: 1,
      minMarks: 1,
      maxMarks: 1
    };

    const envelopes = EncryptVotes.encrypt(
      cvr,
      DEFAULT_MARKING_TYPE,
      thresholdConfig.encryptionKey
    );
    

    // TODO:
    //const numberOfCryptogramsNeeded = this.calculateNumberOfRequiredCryptograms(cvr, ballots[voterGroup]);

    // generate commitment
    //const result = generatePedersenCommitment(messages);
    
    // Submit commitment
    //result.commitment

    // get empty cryptograms
    const trackingCode = EncryptVotes.fingerprint(this.extractCryptograms(envelopes));

    this.voteEncryptions = envelopes

    return trackingCode;
  }

  /**
   * @deprecated
   *
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
  public generateTestCode(): void {
    throw new Error('Not implemented yet');
  }

  /**
   * Should be called when voter chooses to test the encryption of their ballot.
   * Gets commitment opening of the digital ballot box and validates it.
   *
   * @returns Returns undefined if the validation succeeds or throws an error
   * @throws {@link InvalidStateError | InvalidStateError } if called before required data is available
   * @throws ServerCommitmentError if the server commitment is invalid
   * @throws {@link NetworkError | NetworkError } if any request failed to get a response
   */
  public async spoilBallotCryptograms(): Promise<void> {
    // TODO: encrypt the vote cryptograms one more time with a key derived from `this.generateTestCode`.
    //  A key is derived like: key = hash(test code, ballot id, cryptogram index)
    // TODO: compute commitment openings of the voter commitment
    // TODO: call the bulletin board to spoil the cryptograms. Send the encrypted vote cryptograms and voter commitment
    //  opening. Response contains server commitment openings.
    // TODO: verify the server commitment openings against server commitment and server empty cryptograms

    throw new Error('Not implemented yet');
  }

  /**
   * Should be the last call in the entire voting process.
   *
   * Submits encrypted ballot and the affidavit to the digital ballot box.
   *
   *
   * @param affidavit The {@link Affidavit | affidavit} document.
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
   * @throws {@link NetworkError | NetworkError } if any request failed to get a response
   */
  public async submitBallotCryptograms(affidavit: Affidavit): Promise<BallotBoxReceipt> {
    if(!(this.voterSession || this.voteEncryptions)) {
      throw new InvalidStateError('Cannot submit cryptograms. Voter identity unknown or no open envelopes')
    }

    const voterIdentifier = this.voterSession.content.identifier;
    const encryptedVotes = this.voteEncryptions
    const voterPrivateKey = this.privateKey();
    const electionSigningPublicKey = this.electionSigningPublicKey();
    const affidavitConfig = this.affidavitConfig();

    const votesSubmitter = new SubmitVotes(this.bulletinBoard)
    const encryptedAffidavit = votesSubmitter.encryptAffidavit(
      affidavit,
      affidavitConfig
    )

    return await votesSubmitter.signAndSubmitVotes({
        voterIdentifier,
        encryptedVotes,
        voterPrivateKey,
        electionSigningPublicKey,
        encryptedAffidavit
    });
  }

  /**
   * Purges internal data.
   */
  public purgeData(): void {
    // TODO: implement me
    return
  }

  /**
   * Returns data for rendering the list of cryptograms of the ballot
   * @param Map of openable envelopes with cryptograms
   * @return Object containing a cryptogram for each contest
   */
  private extractCryptograms(envelopes: ContestMap<OpenableEnvelope>): ContestMap<Cryptogram> {
    return Object.fromEntries(Object.keys(envelopes).map(contestId =>  [contestId, envelopes[contestId].cryptogram ]))
  }

  public getElectionConfig(): ElectionConfig {
    if(!this.electionConfig){
      throw new InvalidStateError('No configuration loaded. Did you call initialize()?')
    }

    return this.electionConfig
  }

  private electionSigningPublicKey(): ECPoint {
    return this.getElectionConfig().signingPublicKey
  }

  private affidavitConfig(): AffidavitConfig {
    return this.getElectionConfig().affidavit
  }

  private privateKey(): BigNum {
    return this.keyPair.privateKey
  }

  private publicKey(): ECPoint {
    return this.keyPair.publicKey
  }
}

type BigNum = string;
type ECPoint = string;
type Cryptogram = string;

type AffidavitConfig = {
  curve: string;
  encryptionKey: string;
}

export type {
  IAVClient,
  ContestMap,
  CastVoteRecord,
  Affidavit,
  BallotBoxReceipt,
  HashValue,
  Signature,
  ElectionConfig
}

export {
  NistConverter,
  AvClientError,
  AccessCodeExpired,
  AccessCodeInvalid,
  BulletinBoardError,
  CorruptCvrError,
  EmailDoesNotMatchVoterRecordError,
  InvalidConfigError,
  InvalidStateError,
  NetworkError
}
