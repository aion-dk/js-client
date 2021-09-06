"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AVClient = exports.sjcl = void 0;
const bulletin_board_1 = require("../lib/av_client/connectors/bulletin_board");
const election_config_1 = require("../lib/av_client/election_config");
const authenticate_with_codes_1 = require("../lib/av_client/authenticate_with_codes");
const register_voter_1 = require("../lib/av_client/register_voter");
const encrypt_votes_1 = require("../lib/av_client/encrypt_votes");
const benaloh_challenge_1 = require("./av_client/benaloh_challenge");
const submit_votes_1 = require("./av_client/submit_votes");
const voter_authorization_coordinator_1 = require("./av_client/connectors/voter_authorization_coordinator");
const otp_provider_1 = require("./av_client/connectors/otp_provider");
const errors_1 = require("./av_client/errors");
/** @internal */
exports.sjcl = require('../lib/av_client/sjcl');
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
class AVClient {
    /**
     * @param bulletinBoardURL URL to the Assembly Voting backend server, specific for election.
     */
    constructor(bulletinBoardURL) {
        this.bulletinBoard = new bulletin_board_1.BulletinBoard(bulletinBoardURL);
        this.succeededMethods = [];
    }
    async initialize(electionConfig) {
        if (electionConfig)
            this.electionConfig = electionConfig;
        else
            this.electionConfig = await election_config_1.fetchElectionConfig(this.bulletinBoard);
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
    getAuthorizationMethod() {
        switch (this.getElectionConfig().authorizationMode) {
            case 'election codes':
                return {
                    methodName: 'authenticateWithCodes',
                    method: this.authenticateWithCodes
                };
            case 'otps':
                return {
                    methodName: 'requestAccessCode',
                    method: this.requestAccessCode
                };
            default:
                throw new errors_1.InvalidConfigError('Authorization method not found in election config');
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
    async authenticateWithCodes(codes) {
        const authenticationResponse = await new authenticate_with_codes_1.default(this.bulletinBoard)
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
    async requestAccessCode(opaqueVoterId, email) {
        const coordinatorURL = this.getElectionConfig().voterAuthorizationCoordinatorURL;
        const coordinator = new voter_authorization_coordinator_1.default(coordinatorURL);
        return coordinator.createSession(opaqueVoterId, email)
            .then(({ data: { sessionId } }) => {
            return sessionId;
        })
            .then(async (sessionId) => {
            this.authorizationSessionId = sessionId;
            this.email = email;
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
    async validateAccessCode(code) {
        this.validateCallOrder('validateAccessCode');
        const provider = new otp_provider_1.OTPProvider(this.getElectionConfig().OTPProviderURL);
        this.identityConfirmationToken = await provider.requestOTPAuthorization(code, this.email);
        this.succeededMethods.push('validateAccessCode');
        return Promise.resolve();
    }
    /**
     * Registers a voter
     *
     * @returns undefined or throws an error
     */
    async registerVoter() {
        // FIXME this needs to be generated
        this.keyPair = {
            privateKey: '70d161fe8546c88b719c3e511d113a864013cda166f289ff6de9aba3eb4e8a4d',
            publicKey: '039490ed35e0cabb39592792d69b5d4bf2104f20df8c4bbf36ee6b705595e776d2'
        };
        const coordinatorURL = this.getElectionConfig().voterAuthorizationCoordinatorURL;
        const coordinator = new voter_authorization_coordinator_1.default(coordinatorURL);
        const authrorizationResponse = await coordinator.requestPublicKeyAuthorization(this.authorizationSessionId, this.identityConfirmationToken, this.keyPair.publicKey);
        const { voterRecord, authorizationToken } = authrorizationResponse;
        const registerVoterResponse = await register_voter_1.registerVoter(this.bulletinBoard, this.keyPair, this.getElectionConfig().encryptionKey, voterRecord, authorizationToken);
        this.voterIdentifier = registerVoterResponse.voterIdentifier;
        this.emptyCryptograms = registerVoterResponse.emptyCryptograms;
        // FIXME in time we need for config to include all available ballots, 
        // but for registerVoterResponse to return contestIds that the voter has access to
        this.getElectionConfig().ballots = registerVoterResponse.ballots;
        return Promise.resolve();
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
    async constructBallotCryptograms(cvr) {
        this.validateCallOrder('constructBallotCryptograms');
        if (JSON.stringify(Object.keys(cvr)) !== JSON.stringify(this.contestIds())) {
            throw new Error('Corrupt CVR: Contains invalid contest');
        }
        const contests = this.getElectionConfig().ballots;
        const valid_contest_selections = Object.keys(cvr).every(function (contestId) {
            const contest = contests.find(b => b.id.toString() == contestId);
            return contest && contest.options.some(o => o.handle == cvr[contestId]);
        });
        if (!valid_contest_selections) {
            throw new Error('Corrupt CVR: Contains invalid option');
        }
        const emptyCryptograms = Object.fromEntries(Object.keys(cvr).map((contestId) => [contestId, this.emptyCryptograms[contestId].cryptogram]));
        const contestEncodingTypes = Object.fromEntries(Object.keys(cvr).map((contestId) => {
            const contest = contests.find(b => b.id.toString() == contestId);
            // We can use non-null assertion for contest because selections have been validated
            return [contestId, contest.vote_encoding_type];
        }));
        const encryptionResponse = new encrypt_votes_1.default().encrypt(cvr, emptyCryptograms, contestEncodingTypes, this.electionEncryptionKey());
        this.voteEncryptions = encryptionResponse;
        const trackingCode = new encrypt_votes_1.default().fingerprint(this.cryptogramsForConfirmation());
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
        const testCode = new encrypt_votes_1.default().generateTestCode();
        this.testCode = testCode;
        return testCode;
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
    async spoilBallotCryptograms() {
        this.validateCallOrder('spoilBallotCryptograms');
        // TODO: encrypt the vote cryptograms one more time with a key derived from `this.generateTestCode`.
        //  A key is derived like: key = hash(test code, ballot id, cryptogram index)
        // TODO: compute commitment openings of the voter commitment
        // TODO: call the bulletin board to spoil the cryptograms. Send the encrypted vote cryptograms and voter commitment
        //  opening. Response contains server commitment openings.
        // TODO: verify the server commitment openings against server commitment and server empty cryptograms
        const benaloh = new benaloh_challenge_1.default(this.bulletinBoard);
        // this is part of 'offline Benaloh Challenge'
        // const serverRandomizers = await benaloh.getServerRandomizers()
        const voterCommitmentOpening = {};
        const encryptedBallotCryptograms = {};
        const serverCommitment = ''; // get this from the state
        const serverEmptyCryptograms = {}; // get this from the state
        const serverCommitmentOpening = await benaloh.getServerCommitmentOpening(voterCommitmentOpening, encryptedBallotCryptograms);
        const valid = benaloh.verifyCommitmentOpening(serverCommitmentOpening, serverCommitment, serverEmptyCryptograms);
        if (valid) {
            this.succeededMethods.push('spoilBallotCryptograms');
            return Promise.resolve();
        }
        else {
            return Promise.reject('Server commitment did not validate');
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
    async submitBallotCryptograms(affidavit) {
        this.validateCallOrder('submitBallotCryptograms');
        const voterIdentifier = this.voterIdentifier;
        const electionId = this.electionId();
        const voteEncryptions = this.voteEncryptions;
        const privateKey = this.privateKey();
        const signatureKey = this.electionSigningPublicKey();
        return await new submit_votes_1.default(this.bulletinBoard)
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
    purgeData() {
        // TODO: implement me
        return;
    }
    /**
     * Returns data for rendering the list of cryptograms of the ballot
     * @return Object containing a cryptogram for each contest
     */
    cryptogramsForConfirmation() {
        const cryptograms = {};
        const voteEncryptions = this.voteEncryptions;
        this.contestIds().forEach(function (id) {
            cryptograms[id] = voteEncryptions[id].cryptogram;
        });
        return cryptograms;
    }
    getElectionConfig() {
        if (!this.electionConfig) {
            throw new errors_1.InvalidStateError('No configuration loaded. Did you call initialize()?');
        }
        return this.electionConfig;
    }
    electionId() {
        return this.getElectionConfig().election.id;
    }
    contestIds() {
        return this.getElectionConfig().ballots.map(ballot => ballot.id.toString());
    }
    electionEncryptionKey() {
        return this.getElectionConfig().encryptionKey;
    }
    electionSigningPublicKey() {
        return this.getElectionConfig().signingPublicKey;
    }
    privateKey() {
        return this.keyPair.privateKey;
    }
    publicKey() {
        return this.keyPair.publicKey;
    }
    validateCallOrder(methodName) {
        const expectations = {
            validateAccessCode: ['requestAccessCode'],
            constructBallotCryptograms: ['requestAccessCode', 'validateAccessCode'],
            spoilBallotCryptograms: ['requestAccessCode', 'validateAccessCode', 'constructBallotCryptograms'],
            submitBallotCryptograms: ['requestAccessCode', 'validateAccessCode', 'constructBallotCryptograms'],
        };
        const requiredCalls = expectations[methodName];
        if (requiredCalls === undefined) {
            throw new Error(`Call order validation for method #${methodName} is not implemented`);
        }
        else {
            if (JSON.stringify(this.succeededMethods) != JSON.stringify(requiredCalls)) {
                const requiredList = requiredCalls.map((name) => `#${name}`).join(', ');
                const gotList = this.succeededMethods.map((name) => `#${name}`).join(', ');
                throw new errors_1.InvalidStateError(`#${methodName} requires exactly ${requiredList} to be called before it`);
            }
        }
    }
}
exports.AVClient = AVClient;
//# sourceMappingURL=av_client.js.map