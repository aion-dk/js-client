import { extractContestSelections } from './util/nist_cvr_extractor';
import { AVVerifier } from './av_verifier';
import { KeyPair, Affidavit, LatestConfig, BallotSelection, BallotConfig, BallotStatus, ContestConfig } from './av_client/types';
import { IAVClient, ContestMap, BallotBoxReceipt, VoterSessionItem, HashValue, Signature } from './av_client/types';
import { AvClientError, AccessCodeExpired, AccessCodeInvalid, BulletinBoardError, CorruptCvrError, TimeoutError, EmailDoesNotMatchVoterRecordError, InvalidConfigError, InvalidStateError, NetworkError } from './av_client/errors';
import * as sjclLib from './av_client/sjcl';
import { AxiosResponse } from "axios";
/** @internal */
export declare const sjcl: typeof sjclLib;
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
 * |{@link AVClient.spoilBallot | spoilBallot }                               | Optional. Initiates process of testing the ballot encryption. |
 * |{@link AVClient.castBallot | castBallot }                                 | Finalizes the voting process. |
 * |{@link AVClient.purgeData | purgeData }                                   | Optional. Explicitly purges internal data. |
 *
 * ## Example walkthrough test
 *
 * ```typescript
 * [[include:readme_example.test.ts]]
 * ```
 */
export declare class AVClient implements IAVClient {
    private authorizationSessionId;
    private email;
    private votingRoundReference;
    private identityConfirmationToken;
    private dbbPublicKey;
    private bulletinBoard;
    private latestConfig?;
    private keyPair;
    private clientEnvelopes;
    private serverEnvelopes;
    private voterSession;
    private boardCommitment;
    private verifierItem;
    private ballotCryptogramItem;
    private voterCommitmentOpening;
    private spoilRequest;
    private proofOfElectionCodes;
    /**
     * @param bulletinBoardURL URL to the Assembly Voting backend server, specific for election.
     */
    constructor(bulletinBoardURL: string, dbbPublicKey?: string);
    /**
     * Initializes the client with an election config.
     * If no config is provided, it fetches one from the backend.
     *
     * @param latestConfig Allows injection of an election configuration for testing purposes
     * @param keyPair Allows injection of a keypair to support automatic testing
     * @returns Returns undefined if succeeded or throws an error
     * @throws {@link NetworkError | NetworkError } if any request failed to get a response
     */
    initialize(latestConfig?: LatestConfig, keyPair?: KeyPair): Promise<void>;
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
    requestAccessCode(opaqueVoterId: string, email: string): Promise<void>;
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
    validateAccessCode(code: string): Promise<void>;
    generateProofOfElectionCodes(electionCodes: Array<string>): void;
    /**
     * Registers a voter based on the authorization mode of the Voter Authorizer
     * Authorization is done by 'proof-of-identity' or 'proof-of-election-codes'
     */
    createVoterRegistration(votingRoundReference?: string): Promise<void>;
    /**
     * Registers a voter based on the authorization mode of the Voter Authorizer
     * @returns undefined or throws an error
     */
    registerVoter(): Promise<void>;
    expireVoterSessions(votingRoundReference: string): Promise<AxiosResponse>;
    /**
     * Should be called after {@link AVClient.validateAccessCode | validateAccessCode}.
     *
     * Encrypts a {@link BallotSelection | ballot-selection} (CVR) and generates vote cryptograms.
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
     * Should be followed by either {@link AVClient.spoilBallot | spoilBallot}
     * or {@link AVClient.castBallot | castBallot}.
     *
     * @param   ballotSelection BallotSelection containing the selections for each contest.
     * @returns Returns the ballot tracking code. Example:
     * ```javascript
     * '5e4d8fe41fa3819cc064e2ace0eda8a847fe322594a6fd5a9a51c699e63804b7'
     * ```
     * @throws {@link InvalidStateError | InvalidStateError } if called before required data is available
     * @throws {@link CorruptCvrError | CorruptCvrError } if the cast vote record is invalid
     * @throws {@link NetworkError | NetworkError } if any request failed to get a response
     */
    constructBallot(ballotSelection: BallotSelection): Promise<string>;
    /**
   * Should be the last call in the entire voting process.
   *
   * Requests that the previously constructed ballot is cast.
   *
   *
   * @param affidavit The {@link Affidavit | affidavit} document.
   * @return Returns the vote receipt. Example of a receipt:
   * ```javascript
   * {
   *    previousBoardHash: 'd8d9742271592d1b212bbd4cbvobbe357aef8e00cdbdf312df95e9cf9a1a921465',
   *    boardHash: '5a9175c2b3617298d78be7d0244a68f34bc8b2a37061bb4d3fdf97edc1424098',
   *    registeredAt: '2020-03-01T10:00:00.000+01:00',
   *    serverSignature: 'dbcce518142b8740a5c911f727f3c02829211a8ddfccabeb89297877e4198bc1,46826ddfccaac9ca105e39c8a2d015098479624c411b4783ca1a3600daf4e8fa',
   *    voteSubmissionId: 6
      }
   * ```
   * @throws {@link NetworkError | NetworkError } if any request failed to get a response
   */
    castBallot(affidavit?: Affidavit): Promise<BallotBoxReceipt>;
    /**
     * Should be called when voter chooses to test the encryption of their ballot.
     * Gets commitment opening of the digital ballot box and validates it.
     *
     * @returns Returns undefined if the validation succeeds or throws an error
     * @throws {@link InvalidStateError | InvalidStateError } if called before required data is available
     * @throws ServerCommitmentError if the server commitment is invalid
     * @throws {@link NetworkError | NetworkError } if any request failed to get a response
     */
    spoilBallot(): Promise<string>;
    /**
     * Should be called when the voter has 'paired' the verifier and the voting app.
     * Computes and encrypts the clientEncryptionCommitment and posts it to the DBB
     *
     * @returns Returns void if the computation was succesful
     * @throws {@link InvalidStateError | InvalidStateError } if called before required data is available
     * @throws {@link NetworkError | NetworkError } if any request failed to get a response
     */
    challengeBallot(): Promise<void>;
    /**
     * Purges internal data.
     */
    purgeData(): void;
    getLatestConfig(): LatestConfig;
    getVoterSession(): VoterSessionItem;
    getVoterBallotConfig(): BallotConfig;
    getVoterContestConfigs(): ContestConfig[];
    getDbbPublicKey(): string;
    private privateKey;
    /**
     * Registers a voter by proof of identity
     * Used when the authorization mode of the Voter Authorizer is 'proof-of-identity'
     * @returns AxiosResponse or throws an error
     */
    private authorizeIdentity;
    /**
     * Should be called after spoilBallot.
     * Gets the verifier public key from the DBB
     *
     * @returns Returns the pairing code based on the address of the verifier item in the DBB
     * @throws {@link InvalidStateError | InvalidStateError } if called before required data is available
     * @throws {@link TimeoutError | TimeoutError} if the verifier doesn't register itself to the DBB in time
     * @throws {@link NetworkError | NetworkError } if any request failed to get a response
     */
    waitForVerifierRegistration(): Promise<string>;
    /**
     * Finds the ballot status corresponding to the given trackingcode.
     * Also returns the activities associated with the ballot
     *
     * @param trackingCode base58-encoded trackingcode
    */
    checkBallotStatus(trackingCode: string): Promise<BallotStatus>;
}
export type { IAVClient, ContestMap, BallotSelection, Affidavit, BallotBoxReceipt, HashValue, Signature, LatestConfig };
export { extractContestSelections, AVVerifier, AvClientError, AccessCodeExpired, AccessCodeInvalid, BulletinBoardError, CorruptCvrError, TimeoutError, EmailDoesNotMatchVoterRecordError, InvalidConfigError, InvalidStateError, NetworkError };
