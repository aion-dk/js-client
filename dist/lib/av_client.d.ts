import { ElectionConfig } from '../lib/av_client/election_config';
import { ContestIndexed } from './av_client/types';
/** @internal */
export declare const sjcl: any;
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
export declare class AVClient {
    private authorizationSessionId;
    private email;
    private identityConfirmationToken;
    private bulletinBoard;
    private electionConfig?;
    private emptyCryptograms;
    private keyPair;
    private testCode;
    private voteEncryptions;
    private voterIdentifier;
    private succeededMethods;
    /**
     * @param bulletinBoardURL URL to the Assembly Voting backend server, specific for election.
     */
    constructor(bulletinBoardURL: string);
    /**
     * Initializes the client with an election config.
     * If no config is provided, it fetches one from the backend.
     *
     * @param electionConfig override election config object
     * @returns Returns undefined if succeeded or throws an error
     * @throws NetworkError if any request failed to get a response
     */
    initialize(electionConfig: ElectionConfig): Promise<void>;
    initialize(): Promise<void>;
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
    getAuthorizationMethod(): {
        methodName: string;
        method: Function;
    };
    /**
     * Should only be used when election authorization mode is 'election codes'.
     *
     * Authenticates or rejects voter, based on their submitted election codes.
     *
     * @internal
     * @param   codes Array of election code strings.
     * @returns Returns undefined if authentication succeeded or throws an error
     */
    authenticateWithCodes(codes: string[]): Promise<void>;
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
     * @throws InvalidStateError if called before required data is available
     * @throws AccessCodeExpired if an OTP code has expired
     * @throws AccessCodeInvalid if an OTP code is invalid
     * @throws NetworkError if any request failed to get a response
     */
    validateAccessCode(code: string): Promise<void>;
    /**
     * Registers a voter
     *
     * @returns undefined or throws an error
     */
    registerVoter(): Promise<void>;
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
    constructBallotCryptograms(cvr: CastVoteRecord): Promise<string>;
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
    generateTestCode(): string;
    /**
     * Should be called when voter chooses to test the encryption of their ballot.
     * Gets commitment opening of the digital ballot box and validates it.
     *
     * @returns Returns undefined if the validation succeeds or throws an error
     * @throws InvalidStateError if called before required data is available
     * @throws ServerCommitmentError if the server commitment is invalid
     * @throws NetworkError if any request failed to get a response
     */
    spoilBallotCryptograms(): Promise<void>;
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
    submitBallotCryptograms(affidavit: Affidavit): Promise<Receipt>;
    /**
     * Purges internal data.
     */
    purgeData(): void;
    /**
     * Returns data for rendering the list of cryptograms of the ballot
     * @return Object containing a cryptogram for each contest
     */
    private cryptogramsForConfirmation;
    getElectionConfig(): ElectionConfig;
    private electionId;
    private contestIds;
    private electionEncryptionKey;
    private electionSigningPublicKey;
    private privateKey;
    private publicKey;
    private validateCallOrder;
}
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
export declare type Receipt = {
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
export declare type CastVoteRecord = ContestIndexed<string>;
/**
 * For now, we assume it is just a string.
 */
export declare type Affidavit = string;
