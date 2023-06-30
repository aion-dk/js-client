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
exports.AVVerifier = void 0;
var bulletin_board_1 = require("./av_client/connectors/bulletin_board");
var constants_1 = require("./av_client/constants");
var generate_key_pair_1 = require("./av_client/generate_key_pair");
var sign_1 = require("./av_client/sign");
var short_codes_1 = require("./av_client/short_codes");
var election_config_1 = require("./av_client/election_config");
var commitments_1 = require("./av_client/crypto/commitments");
var errors_1 = require("./av_client/errors");
var decrypt_contest_selections_1 = require("./av_client/new_crypto/decrypt_contest_selections");
var option_finder_1 = require("./av_client/option_finder");
var commitments_2 = require("./av_client/new_crypto/commitments");
var AVVerifier = /** @class */ (function () {
    /**
     * @param bulletinBoardURL URL to the Assembly Voting backend server, specific for election.
     */
    function AVVerifier(bulletinBoardURL, dbbPublicKey) {
        this.bulletinBoard = new bulletin_board_1.BulletinBoard(bulletinBoardURL);
        this.dbbPublicKey = dbbPublicKey;
    }
    /**
     * Initializes the client with an election config.
     * If no config is provided, it fetches one from the backend.
     *
     * @param electionConfig Allows injection of an election configuration for testing purposes
     * @param keyPair Allows injection of a keypair to support automatic testing
     * @returns Returns undefined if succeeded or throws an error
     * @throws {@link NetworkError | NetworkError } if any request failed to get a response
     */
    AVVerifier.prototype.initialize = function (latestConfig) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!latestConfig) return [3 /*break*/, 1];
                        this.latestConfig = latestConfig;
                        return [3 /*break*/, 3];
                    case 1:
                        _a = this;
                        return [4 /*yield*/, (0, election_config_1.fetchLatestConfig)(this.bulletinBoard)];
                    case 2:
                        _a.latestConfig = _b.sent();
                        _b.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AVVerifier.prototype.findBallot = function (trackingCode) {
        return __awaiter(this, void 0, void 0, function () {
            var shortAddress;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        shortAddress = (0, short_codes_1.shortCodeToHex)(trackingCode);
                        return [4 /*yield*/, this.bulletinBoard.getVotingTrack(shortAddress).then(function (response) {
                                if (shortAddress !== response.data.verificationTrackStart.shortAddress) {
                                    throw new errors_1.InvalidTrackingCodeError("Tracking code and short address from response doesn't match");
                                }
                                if (['voterCommitment', 'serverCommitment', 'ballotCryptograms', 'verificationTrackStart']
                                    .every(function (p) { return Object.keys(response.data).includes(p); })) {
                                    _this.cryptogramAddress = response.data.ballotCryptograms.address;
                                    _this.voterCommitment = response.data.voterCommitment.content.commitment;
                                    _this.boardCommitment = response.data.serverCommitment.content.commitment;
                                    _this.ballotCryptograms = response.data.ballotCryptograms;
                                }
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.cryptogramAddress];
                }
            });
        });
    };
    AVVerifier.prototype.submitVerifierKey = function (spoilRequestAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var keyPair, verfierItem, signedVerifierItem, _a, pairingCode;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        keyPair = (0, generate_key_pair_1.randomKeyPair)();
                        this.verifierPrivateKey = keyPair.privateKey;
                        verfierItem = {
                            type: constants_1.VERIFIER_ITEM,
                            parentAddress: spoilRequestAddress,
                            content: {
                                publicKey: keyPair.publicKey
                            }
                        };
                        signedVerifierItem = (0, sign_1.signPayload)(verfierItem, keyPair.privateKey);
                        // TODO: Validate payload and receipt
                        // check verifierItem.previousAddress === verificationTrackStartItem address
                        _a = this;
                        return [4 /*yield*/, this.bulletinBoard.submitVerifierItem(signedVerifierItem)];
                    case 1:
                        // TODO: Validate payload and receipt
                        // check verifierItem.previousAddress === verificationTrackStartItem address
                        _a.verifierItem = (_b.sent()).data.verifier;
                        pairingCode = (0, short_codes_1.hexToShortCode)(this.verifierItem.shortAddress);
                        return [2 /*return*/, pairingCode];
                }
            });
        });
    };
    AVVerifier.prototype.decryptBallot = function () {
        if (!this.verifierPrivateKey) {
            throw new Error('Verifier private key not present');
        }
        var boardCommitmentOpening = (0, commitments_1.decryptCommitmentOpening)(this.verifierPrivateKey, this.boardCommitmentOpening.content.package);
        var voterCommitmentOpening = (0, commitments_1.decryptCommitmentOpening)(this.verifierPrivateKey, this.voterCommitmentOpening.content.package);
        (0, commitments_2.validateCommitment)(boardCommitmentOpening, this.boardCommitment, 'Board commitment not valid');
        (0, commitments_2.validateCommitment)(voterCommitmentOpening, this.voterCommitment, 'Voter commitment not valid');
        return (0, decrypt_contest_selections_1.decryptContestSelections)(this.latestConfig.items.contestConfigs, this.latestConfig.items.thresholdConfig.content.encryptionKey, this.ballotCryptograms.content.contests, boardCommitmentOpening, voterCommitmentOpening);
    };
    AVVerifier.prototype.pollForSpoilRequest = function () {
        return __awaiter(this, void 0, void 0, function () {
            var attempts, executePoll;
            var _this = this;
            return __generator(this, function (_a) {
                attempts = 0;
                executePoll = function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var result;
                    var _a, _b, _c, _d;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0: return [4 /*yield*/, this.bulletinBoard.getSpoilRequestItem(this.cryptogramAddress).catch(function (error) {
                                    console.error(error.response.data.error_message);
                                })];
                            case 1:
                                result = _e.sent();
                                attempts++;
                                if (((_b = (_a = result === null || result === void 0 ? void 0 : result.data) === null || _a === void 0 ? void 0 : _a.item) === null || _b === void 0 ? void 0 : _b.type) === constants_1.SPOIL_REQUEST_ITEM) {
                                    return [2 /*return*/, resolve(result.data.item.address)];
                                }
                                else if (((_d = (_c = result === null || result === void 0 ? void 0 : result.data) === null || _c === void 0 ? void 0 : _c.item) === null || _d === void 0 ? void 0 : _d.type) === constants_1.CAST_REQUEST_ITEM) {
                                    return [2 /*return*/, reject(new Error('Ballot has been cast and cannot be spoiled'))];
                                }
                                else if (constants_1.MAX_POLL_ATTEMPTS && attempts === constants_1.MAX_POLL_ATTEMPTS) {
                                    return [2 /*return*/, reject(new Error('Exceeded max attempts'))];
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
    AVVerifier.prototype.getReadableContestSelections = function (contestSelections, locale) {
        var _this = this;
        var localizer = makeLocalizer(locale);
        return contestSelections.map(function (cs) {
            var contestConfig = _this.latestConfig.items.contestConfigs[cs.reference];
            if (!contestConfig) {
                throw new errors_1.InvalidContestError("Contest is not present in the election");
            }
            var optionFinder = (0, option_finder_1.makeOptionFinder)(contestConfig.content.options);
            var readablePiles = cs.piles.map(function (pile) { return ({
                multiplier: pile.multiplier,
                optionSelections: pile.optionSelections.map(function (os) {
                    var optionConfig = optionFinder(os.reference);
                    return {
                        reference: os.reference,
                        title: localizer(optionConfig.title),
                        text: os.text,
                    };
                })
            }); });
            return {
                reference: cs.reference,
                title: localizer(contestConfig.content.title),
                piles: readablePiles
            };
        });
    };
    AVVerifier.prototype.pollForCommitmentOpening = function () {
        var _this = this;
        var attempts = 0;
        var executePoll = function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var result;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.bulletinBoard.getCommitmentOpenings(this.verifierItem.address).catch(function (error) {
                            console.error(error.response.data.error_message);
                        })];
                    case 1:
                        result = _c.sent();
                        attempts++;
                        if (((_a = result === null || result === void 0 ? void 0 : result.data) === null || _a === void 0 ? void 0 : _a.voterCommitmentOpening) && ((_b = result === null || result === void 0 ? void 0 : result.data) === null || _b === void 0 ? void 0 : _b.boardCommitmentOpening)) {
                            this.boardCommitmentOpening = result.data.boardCommitmentOpening;
                            this.voterCommitmentOpening = result.data.voterCommitmentOpening;
                            return [2 /*return*/, resolve(result.data)];
                        }
                        else if (constants_1.MAX_POLL_ATTEMPTS && attempts === constants_1.MAX_POLL_ATTEMPTS) {
                            return [2 /*return*/, reject(new Error('Exceeded max attempts'))];
                        }
                        else {
                            setTimeout(executePoll, constants_1.POLLING_INTERVAL_MS, resolve, reject);
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        return new Promise(executePoll);
    };
    return AVVerifier;
}());
exports.AVVerifier = AVVerifier;
function makeLocalizer(locale) {
    return function (field) {
        var availableFields = Object.keys(field);
        if (availableFields.length === 0) {
            throw new Error('No localized data available');
        }
        return field[locale] || field[availableFields[0]];
    };
}
//# sourceMappingURL=av_verifier.js.map