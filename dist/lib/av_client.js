"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkError = exports.InvalidStateError = exports.InvalidConfigError = exports.EmailDoesNotMatchVoterRecordError = exports.TimeoutError = exports.CorruptCvrError = exports.BulletinBoardError = exports.AccessCodeInvalid = exports.AccessCodeExpired = exports.AvClientError = exports.AVVerifier = exports.extractContestSelections = exports.AVClient = exports.sjcl = void 0;
var bulletin_board_1 = require("./av_client/connectors/bulletin_board");
var voter_authorization_coordinator_1 = require("./av_client/connectors/voter_authorization_coordinator");
var otp_provider_1 = require("./av_client/connectors/otp_provider");
var nist_cvr_extractor_1 = require("./util/nist_cvr_extractor");
Object.defineProperty(exports, "extractContestSelections", { enumerable: true, get: function () { return nist_cvr_extractor_1.extractContestSelections; } });
var av_verifier_1 = require("./av_verifier");
Object.defineProperty(exports, "AVVerifier", { enumerable: true, get: function () { return av_verifier_1.AVVerifier; } });
var construct_contest_envelopes_1 = require("./av_client/construct_contest_envelopes");
var generate_key_pair_1 = require("./av_client/generate_key_pair");
var generate_receipt_1 = require("./av_client/generate_receipt");
var buffer_1 = require("buffer");
var jwt_decode_1 = require("jwt-decode");
var election_config_1 = require("./av_client/election_config");
var errors_1 = require("./av_client/errors");
Object.defineProperty(exports, "AvClientError", { enumerable: true, get: function () { return errors_1.AvClientError; } });
Object.defineProperty(exports, "AccessCodeExpired", { enumerable: true, get: function () { return errors_1.AccessCodeExpired; } });
Object.defineProperty(exports, "AccessCodeInvalid", { enumerable: true, get: function () { return errors_1.AccessCodeInvalid; } });
Object.defineProperty(exports, "BulletinBoardError", { enumerable: true, get: function () { return errors_1.BulletinBoardError; } });
Object.defineProperty(exports, "CorruptCvrError", { enumerable: true, get: function () { return errors_1.CorruptCvrError; } });
Object.defineProperty(exports, "TimeoutError", { enumerable: true, get: function () { return errors_1.TimeoutError; } });
Object.defineProperty(exports, "EmailDoesNotMatchVoterRecordError", { enumerable: true, get: function () { return errors_1.EmailDoesNotMatchVoterRecordError; } });
Object.defineProperty(exports, "InvalidConfigError", { enumerable: true, get: function () { return errors_1.InvalidConfigError; } });
Object.defineProperty(exports, "InvalidStateError", { enumerable: true, get: function () { return errors_1.InvalidStateError; } });
Object.defineProperty(exports, "NetworkError", { enumerable: true, get: function () { return errors_1.NetworkError; } });
var sjclLib = require("./av_client/sjcl");
var sign_1 = require("./av_client/sign");
var submit_voter_commitment_1 = require("./av_client/actions/submit_voter_commitment");
var constants_1 = require("./av_client/constants");
var short_codes_1 = require("./av_client/short_codes");
var commitments_1 = require("./av_client/crypto/commitments");
var submit_ballot_cryptograms_1 = require("./av_client/actions/submit_ballot_cryptograms");
var proof_of_election_codes_1 = require("./av_client/crypto/proof_of_election_codes");
var aes_1 = require("./av_client/crypto/aes");
var commitments_2 = require("./av_client/new_crypto/commitments");
/** @internal */
exports.sjcl = sjclLib;
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
var AVClient = /** @class */ (function () {
    /**
     * @param bulletinBoardURL URL to the Assembly Voting backend server, specific for election.
     */
    function AVClient(bulletinBoardURL, dbbPublicKey) {
        this.bulletinBoard = new bulletin_board_1.BulletinBoard(bulletinBoardURL);
        this.dbbPublicKey = dbbPublicKey;
    }
    /**
     * Initializes the client with an election config.
     * If no config is provided, it fetches one from the backend.
     *
     * @param latestConfig Allows injection of an election configuration for testing purposes
     * @param keyPair Allows injection of a keypair to support automatic testing
     * @returns Returns undefined if succeeded or throws an error
     * @throws {@link NetworkError | NetworkError } if any request failed to get a response
     */
    AVClient.prototype.initialize = function (latestConfig, keyPair) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!latestConfig) return [3 /*break*/, 1];
                        (0, election_config_1.validateLatestConfig)(latestConfig);
                        this.latestConfig = latestConfig;
                        return [3 /*break*/, 3];
                    case 1:
                        _a = this;
                        return [4 /*yield*/, (0, election_config_1.fetchLatestConfig)(this.bulletinBoard)];
                    case 2:
                        _a.latestConfig = _b.sent();
                        _b.label = 3;
                    case 3:
                        if (keyPair) {
                            this.keyPair = keyPair;
                        }
                        else {
                            this.keyPair = (0, generate_key_pair_1.randomKeyPair)();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
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
    AVClient.prototype.requestAccessCode = function (opaqueVoterId, email) {
        return __awaiter(this, void 0, void 0, function () {
            var coordinatorURL, voterAuthorizerContextUuid, coordinator;
            var _this = this;
            return __generator(this, function (_a) {
                coordinatorURL = this.getLatestConfig().items.voterAuthorizerConfig.content.voterAuthorizer.url;
                voterAuthorizerContextUuid = this.getLatestConfig().items.voterAuthorizerConfig.content.voterAuthorizer.contextUuid;
                coordinator = new voter_authorization_coordinator_1.default(coordinatorURL, voterAuthorizerContextUuid);
                return [2 /*return*/, coordinator.createSession(opaqueVoterId, email)
                        .then(function (_a) {
                        var sessionId = _a.data.sessionId;
                        return sessionId;
                    })
                        .then(function (sessionId) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            this.authorizationSessionId = sessionId;
                            this.email = email;
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
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
    AVClient.prototype.validateAccessCode = function (code) {
        return __awaiter(this, void 0, void 0, function () {
            var otpProviderUrl, otpProviderElectionContextUuid, provider, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.email)
                            throw new errors_1.InvalidStateError('Cannot validate access code. Access code was not requested.');
                        otpProviderUrl = this.getLatestConfig().items.voterAuthorizerConfig.content.identityProvider.url;
                        otpProviderElectionContextUuid = this.getLatestConfig().items.voterAuthorizerConfig.content.identityProvider.contextUuid;
                        provider = new otp_provider_1.OTPProvider(otpProviderUrl, otpProviderElectionContextUuid);
                        _a = this;
                        return [4 /*yield*/, provider.requestOTPAuthorization(code, this.email)];
                    case 1:
                        _a.identityConfirmationToken = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AVClient.prototype.generateProofOfElectionCodes = function (electionCodes) {
        this.proofOfElectionCodes = new proof_of_election_codes_1.ProofOfElectionCodes(electionCodes);
    };
    /**
     * Registers a voter based on the authorization mode of the Voter Authorizer
     * Authorization is done by 'proof-of-identity' or 'proof-of-election-codes'
     */
    AVClient.prototype.createVoterRegistration = function (votingRoundReference) {
        if (votingRoundReference === void 0) { votingRoundReference = "voting-round-1"; }
        return __awaiter(this, void 0, void 0, function () {
            var coordinatorURL, voterAuthorizerContextUuid, coordinator, latestConfigAddress, authorizationMode, authorizationResponse, authToken, decoded, voterSessionItemExpectation, voterSessionItemResponse, voterSessionItem, receipt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        coordinatorURL = this.getLatestConfig().items.voterAuthorizerConfig.content.voterAuthorizer.url;
                        voterAuthorizerContextUuid = this.getLatestConfig().items.voterAuthorizerConfig.content.voterAuthorizer.contextUuid;
                        coordinator = new voter_authorization_coordinator_1.default(coordinatorURL, voterAuthorizerContextUuid);
                        latestConfigAddress = this.getLatestConfig().items.latestConfigItem.address;
                        authorizationMode = this.getLatestConfig().items.voterAuthorizerConfig.content.voterAuthorizer.authorizationMode;
                        this.votingRoundReference = votingRoundReference;
                        if (!(authorizationMode === 'proof-of-identity')) return [3 /*break*/, 2];
                        if (!this.identityConfirmationToken)
                            throw new errors_1.InvalidStateError('Cannot register voter without identity confirmation. User has not validated access code.');
                        return [4 /*yield*/, this.authorizeIdentity(coordinator)];
                    case 1:
                        authorizationResponse = _a.sent();
                        return [3 /*break*/, 5];
                    case 2:
                        if (!(authorizationMode === 'proof-of-election-codes')) return [3 /*break*/, 4];
                        if (this.proofOfElectionCodes == null)
                            throw new errors_1.InvalidStateError('Cannot register voter without proof of election codes. User has not generated an election codes proof.');
                        return [4 /*yield*/, coordinator.authorizeProofOfElectionCodes(this.keyPair.publicKey, this.proofOfElectionCodes, this.votingRoundReference)];
                    case 3:
                        authorizationResponse = _a.sent();
                        return [3 /*break*/, 5];
                    case 4: throw new errors_1.InvalidConfigError("Unknown authorization mode of voter authorizer: '".concat(authorizationMode, "'"));
                    case 5:
                        authToken = authorizationResponse.data.authToken;
                        decoded = (0, jwt_decode_1.default)(authToken);
                        if (decoded === null)
                            throw new errors_1.InvalidTokenError('Auth token could not be decoded');
                        voterSessionItemExpectation = {
                            type: constants_1.VOTER_SESSION_ITEM,
                            parentAddress: latestConfigAddress,
                            content: {
                                authToken: authToken,
                                identifier: decoded['identifier'],
                                publicKey: decoded['public_key'],
                                weight: decoded['weight'] || 1,
                                voterGroup: decoded['voter_group_key'],
                                votingRoundReference: decoded['voting_round_reference']
                            }
                        };
                        return [4 /*yield*/, this.bulletinBoard.createVoterRegistration(authToken, latestConfigAddress)];
                    case 6:
                        voterSessionItemResponse = _a.sent();
                        voterSessionItem = voterSessionItemResponse.data.voterSession;
                        receipt = voterSessionItemResponse.data.receipt;
                        (0, sign_1.validatePayload)(voterSessionItem, voterSessionItemExpectation, this.getDbbPublicKey());
                        (0, sign_1.validateReceipt)([voterSessionItem], receipt, this.getDbbPublicKey());
                        this.voterSession = voterSessionItem;
                        this.bulletinBoard.setVoterSessionUuid(voterSessionItem.content.identifier);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Registers a voter based on the authorization mode of the Voter Authorizer
     * @returns undefined or throws an error
     */
    AVClient.prototype.registerVoter = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createVoterRegistration()];
            });
        });
    };
    AVClient.prototype.expireVoterSessions = function (votingRoundReference) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, vaUrl, vaUuid, authorizationMode, latestConfigAddress, coordinator, authorizationResponse, _b, authToken, decodedAuthToken;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this.getLatestConfig().items.voterAuthorizerConfig.content.voterAuthorizer, vaUrl = _a.url, vaUuid = _a.contextUuid, authorizationMode = _a.authorizationMode;
                        latestConfigAddress = this.getLatestConfig().items.latestConfigItem.address;
                        coordinator = new voter_authorization_coordinator_1.default(vaUrl, vaUuid);
                        _b = authorizationMode;
                        switch (_b) {
                            case "proof-of-election-codes": return [3 /*break*/, 1];
                            case "proof-of-identity": return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 4];
                    case 1: return [4 /*yield*/, coordinator.authorizeProofOfElectionCodes(this.keyPair.publicKey, this.proofOfElectionCodes, votingRoundReference, "expire")];
                    case 2:
                        authorizationResponse = _c.sent();
                        return [3 /*break*/, 5];
                    case 3: throw new errors_1.InvalidStateError("voter_authorizer.expire_voter.proof_of_identity_not_supported");
                    case 4: throw new errors_1.InvalidConfigError("Unknown authorization mode of voter authorizer: '".concat(authorizationMode, "'"));
                    case 5:
                        authToken = authorizationResponse.data.authToken;
                        decodedAuthToken = (0, jwt_decode_1.default)(authToken);
                        if (decodedAuthToken === null)
                            throw new errors_1.InvalidTokenError('Auth token could not be decoded');
                        return [4 /*yield*/, this.bulletinBoard.expireVoterSessions(authToken, latestConfigAddress)];
                    case 6: return [2 /*return*/, _c.sent()];
                }
            });
        });
    };
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
    AVClient.prototype.constructBallot = function (ballotSelection) {
        return __awaiter(this, void 0, void 0, function () {
            var state, _a, pedersenCommitment, envelopeRandomizers, contestEnvelopes, contestPilesMap, _b, boardCommitment, serverEnvelopes, _c, ballotCryptogramItem, verificationStartItem, trackingCode;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!(this.voterSession)) {
                            throw new errors_1.InvalidStateError('Cannot construct cryptograms. Voter identity unknown');
                        }
                        state = {
                            voterSession: this.voterSession,
                            latestConfig: this.getLatestConfig(),
                            votingRoundReference: this.votingRoundReference
                        };
                        _a = (0, construct_contest_envelopes_1.constructContestEnvelopes)(state, ballotSelection), pedersenCommitment = _a.pedersenCommitment, envelopeRandomizers = _a.envelopeRandomizers, contestEnvelopes = _a.contestEnvelopes;
                        this.clientEnvelopes = contestEnvelopes;
                        this.voterCommitmentOpening = {
                            commitmentRandomness: pedersenCommitment.randomizer,
                            randomizers: envelopeRandomizers
                        };
                        contestPilesMap = contestEnvelopes.map(function (ce) { return [ce.reference, ce.piles.length]; });
                        return [4 /*yield*/, (0, submit_voter_commitment_1.default)(this.bulletinBoard, this.voterSession.address, pedersenCommitment.commitment, this.privateKey(), Object.fromEntries(contestPilesMap), this.getDbbPublicKey())];
                    case 1:
                        _b = _d.sent(), boardCommitment = _b.boardCommitment, serverEnvelopes = _b.serverEnvelopes;
                        this.boardCommitment = boardCommitment;
                        this.serverEnvelopes = serverEnvelopes;
                        return [4 /*yield*/, (0, submit_ballot_cryptograms_1.submitBallotCryptograms)(this.bulletinBoard, this.clientEnvelopes, this.serverEnvelopes, boardCommitment.address, this.privateKey(), this.getDbbPublicKey())];
                    case 2:
                        _c = _d.sent(), ballotCryptogramItem = _c[0], verificationStartItem = _c[1];
                        this.ballotCryptogramItem = ballotCryptogramItem;
                        trackingCode = (0, short_codes_1.hexToShortCode)(verificationStartItem.shortAddress);
                        return [2 /*return*/, trackingCode];
                }
            });
        });
    };
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
    AVClient.prototype.castBallot = function (affidavit) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var castRequestItem, encryptedAffidavit, signedPayload, response, _e, castRequest, receipt;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        // Affidavit must be base64 encoded
                        if (!(this.voterSession)) {
                            throw new errors_1.InvalidStateError('Cannot create cast request cryptograms. Ballot cryptograms not present');
                        }
                        castRequestItem = {
                            parentAddress: this.ballotCryptogramItem.address,
                            type: constants_1.CAST_REQUEST_ITEM,
                            content: {}
                        };
                        if (affidavit && ((_d = (_c = (_b = (_a = this === null || this === void 0 ? void 0 : this.latestConfig) === null || _a === void 0 ? void 0 : _a.items) === null || _b === void 0 ? void 0 : _b.electionConfig) === null || _c === void 0 ? void 0 : _c.content) === null || _d === void 0 ? void 0 : _d.castRequestItemAttachmentEncryptionKey)) {
                            try {
                                encryptedAffidavit = (0, aes_1.dhEncrypt)(this.latestConfig.items.electionConfig.content.castRequestItemAttachmentEncryptionKey, affidavit).toString();
                                castRequestItem.content['attachment'] = exports.sjcl.codec.hex.fromBits(exports.sjcl.hash.sha256.hash(encryptedAffidavit));
                            }
                            catch (err) {
                                console.error(err);
                            }
                        }
                        signedPayload = (0, sign_1.signPayload)(castRequestItem, this.privateKey());
                        if (encryptedAffidavit) {
                            signedPayload['attachment'] = "data:text/plain;base64,".concat(buffer_1.Buffer.from(encryptedAffidavit).toString('base64'));
                        }
                        return [4 /*yield*/, this.bulletinBoard.submitCastRequest(signedPayload)];
                    case 1:
                        response = (_f.sent());
                        _e = response.data, castRequest = _e.castRequest, receipt = _e.receipt;
                        (0, sign_1.validatePayload)(castRequest, castRequestItem);
                        (0, sign_1.validateReceipt)([castRequest], receipt, this.getDbbPublicKey());
                        return [2 /*return*/, (0, generate_receipt_1.generateReceipt)(receipt, castRequest)];
                }
            });
        });
    };
    /**
     * Should be called when voter chooses to test the encryption of their ballot.
     * Gets commitment opening of the digital ballot box and validates it.
     *
     * @returns Returns undefined if the validation succeeds or throws an error
     * @throws {@link InvalidStateError | InvalidStateError } if called before required data is available
     * @throws ServerCommitmentError if the server commitment is invalid
     * @throws {@link NetworkError | NetworkError } if any request failed to get a response
     */
    AVClient.prototype.spoilBallot = function () {
        return __awaiter(this, void 0, void 0, function () {
            var spoilRequestItem, signedPayload, response, _a, spoilRequest, receipt, boardCommitmentOpening;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(this.voterSession)) {
                            throw new errors_1.InvalidStateError('Cannot create cast request cryptograms. Ballot cryptograms not present');
                        }
                        spoilRequestItem = {
                            parentAddress: this.ballotCryptogramItem.address,
                            type: constants_1.SPOIL_REQUEST_ITEM,
                            content: {}
                        };
                        signedPayload = (0, sign_1.signPayload)(spoilRequestItem, this.privateKey());
                        return [4 /*yield*/, this.bulletinBoard.submitSpoilRequest(signedPayload)];
                    case 1:
                        response = (_b.sent());
                        _a = response.data, spoilRequest = _a.spoilRequest, receipt = _a.receipt, boardCommitmentOpening = _a.boardCommitmentOpening;
                        this.spoilRequest = spoilRequest;
                        (0, sign_1.validatePayload)(spoilRequest, spoilRequestItem);
                        (0, sign_1.validateReceipt)([spoilRequest], receipt, this.getDbbPublicKey());
                        (0, commitments_2.validateCommitment)(boardCommitmentOpening, this.boardCommitment.content.commitment, 'Board commitment is not valid');
                        return [2 /*return*/, spoilRequest.address];
                }
            });
        });
    };
    /**
     * Should be called when the voter has 'paired' the verifier and the voting app.
     * Computes and encrypts the clientEncryptionCommitment and posts it to the DBB
     *
     * @returns Returns void if the computation was succesful
     * @throws {@link InvalidStateError | InvalidStateError } if called before required data is available
     * @throws {@link NetworkError | NetworkError } if any request failed to get a response
     */
    AVClient.prototype.challengeBallot = function () {
        return __awaiter(this, void 0, void 0, function () {
            var voterCommitmentOpeningItem, signedVoterCommitmentOpeningItem;
            return __generator(this, function (_a) {
                if (!(this.voterSession)) {
                    throw new errors_1.InvalidStateError('Cannot challenge ballot, no user session');
                }
                voterCommitmentOpeningItem = {
                    parentAddress: this.verifierItem.address,
                    type: constants_1.VOTER_ENCRYPTION_COMMITMENT_OPENING_ITEM,
                    content: {
                        package: (0, commitments_1.encryptCommitmentOpening)(this.verifierItem.content.publicKey, this.voterCommitmentOpening)
                    }
                };
                signedVoterCommitmentOpeningItem = (0, sign_1.signPayload)(voterCommitmentOpeningItem, this.privateKey());
                this.bulletinBoard.submitCommitmentOpenings(signedVoterCommitmentOpeningItem);
                return [2 /*return*/];
            });
        });
    };
    /**
     * Purges internal data.
     */
    AVClient.prototype.purgeData = function () {
        // TODO: implement me
        return;
    };
    AVClient.prototype.getLatestConfig = function () {
        if (!this.latestConfig) {
            throw new errors_1.InvalidStateError('No configuration loaded. Did you call initialize()?');
        }
        return this.latestConfig;
    };
    AVClient.prototype.getVoterSession = function () {
        if (!this.voterSession) {
            throw new errors_1.InvalidStateError('No voter session loaded');
        }
        return this.voterSession;
    };
    AVClient.prototype.getVoterBallotConfig = function () {
        var voterSession = this.getVoterSession();
        var ballotConfigs = this.getLatestConfig().items.ballotConfigs;
        return ballotConfigs[voterSession.content.voterGroup];
    };
    AVClient.prototype.getVoterContestConfigs = function () {
        var voterSession = this.getVoterSession();
        var _a = this.getLatestConfig().items, ballotConfigs = _a.ballotConfigs, votingRoundConfigs = _a.votingRoundConfigs, contestConfigs = _a.contestConfigs;
        var myBallotConfig = ballotConfigs[voterSession.content.voterGroup];
        var myVotingRoundConfig = votingRoundConfigs[voterSession.content.votingRoundReference];
        var contestsICanVoteOn = myBallotConfig.content.contestReferences.filter(function (value) { return myVotingRoundConfig.content.contestReferences.includes(value); });
        return contestsICanVoteOn.map(function (contestReference) {
            return contestConfigs[contestReference];
        });
    };
    AVClient.prototype.getDbbPublicKey = function () {
        var dbbPublicKeyFromConfig = this.getLatestConfig().items.genesisConfig.content.publicKey;
        if (this.dbbPublicKey) {
            return this.dbbPublicKey;
        }
        else if (dbbPublicKeyFromConfig) {
            return dbbPublicKeyFromConfig;
        }
        else {
            throw new errors_1.InvalidStateError('No DBB public key available');
        }
    };
    AVClient.prototype.privateKey = function () {
        return this.keyPair.privateKey;
    };
    /**
     * Registers a voter by proof of identity
     * Used when the authorization mode of the Voter Authorizer is 'proof-of-identity'
     * @returns AxiosResponse or throws an error
     */
    AVClient.prototype.authorizeIdentity = function (coordinator) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, coordinator.requestPublicKeyAuthorization(this.authorizationSessionId, this.identityConfirmationToken, this.keyPair.publicKey, this.votingRoundReference)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Should be called after spoilBallot.
     * Gets the verifier public key from the DBB
     *
     * @returns Returns the pairing code based on the address of the verifier item in the DBB
     * @throws {@link InvalidStateError | InvalidStateError } if called before required data is available
     * @throws {@link TimeoutError | TimeoutError} if the verifier doesn't register itself to the DBB in time
     * @throws {@link NetworkError | NetworkError } if any request failed to get a response
     */
    AVClient.prototype.waitForVerifierRegistration = function () {
        return __awaiter(this, void 0, void 0, function () {
            var attempts, executePoll;
            var _this = this;
            return __generator(this, function (_a) {
                if (!(this.voterSession)) {
                    throw new errors_1.InvalidStateError('Cannot challenge ballot, no user session');
                }
                attempts = 0;
                executePoll = function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var result, pairingCode;
                    var _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0: return [4 /*yield*/, this.bulletinBoard.getVerifierItem(this.spoilRequest.address).catch(function (error) {
                                    console.error(error.response.data.error_message);
                                })];
                            case 1:
                                result = _c.sent();
                                attempts++;
                                if (((_b = (_a = result === null || result === void 0 ? void 0 : result.data) === null || _a === void 0 ? void 0 : _a.verifier) === null || _b === void 0 ? void 0 : _b.type) === constants_1.VERIFIER_ITEM) {
                                    this.verifierItem = result.data.verifier;
                                    pairingCode = (0, short_codes_1.hexToShortCode)(result.data.verifier.shortAddress);
                                    return [2 /*return*/, resolve(pairingCode)];
                                }
                                else if (constants_1.MAX_POLL_ATTEMPTS && attempts === constants_1.MAX_POLL_ATTEMPTS) {
                                    return [2 /*return*/, reject(new errors_1.TimeoutError('Exceeded max attempts'))];
                                }
                                else {
                                    setTimeout(executePoll, constants_1.POLLING_INTERVAL_MS, resolve, reject);
                                }
                                return [2 /*return*/];
                        }
                    });
                }); };
                return [2 /*return*/, new Promise(executePoll)];
            });
        });
    };
    /**
     * Finds the ballot status corresponding to the given trackingcode.
     * Also returns the activities associated with the ballot
     *
     * @param trackingCode base58-encoded trackingcode
    */
    AVClient.prototype.checkBallotStatus = function (trackingCode) {
        return __awaiter(this, void 0, void 0, function () {
            var shortAddres, _a, status, activities, ballotStatus;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        shortAddres = (0, short_codes_1.shortCodeToHex)(trackingCode);
                        return [4 /*yield*/, this.bulletinBoard.getBallotStatus(shortAddres)];
                    case 1:
                        _a = (_b.sent()).data, status = _a.status, activities = _a.activities;
                        ballotStatus = {
                            activities: activities,
                            status: status
                        };
                        return [2 /*return*/, ballotStatus];
                }
            });
        });
    };
    return AVClient;
}());
exports.AVClient = AVClient;
//# sourceMappingURL=av_client.js.map