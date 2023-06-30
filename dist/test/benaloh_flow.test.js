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
var axios_1 = require("axios");
var test_helpers_1 = require("./test_helpers");
var test_helpers_2 = require("./test_helpers");
var av_verifier_1 = require("../lib/av_verifier");
var av_client_1 = require("../lib/av_client");
var chai_1 = require("chai");
describe.skip('entire benaloh flow', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = (0, test_helpers_1.resetDeterminism)();
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('spoils a ballot', function () { return __awaiter(void 0, void 0, void 0, function () {
        var verifier, client, trackingCode, pollForSpoilPromise, verfierPairingCode, clientPairingCode, verifierPairingCode, contestSelections, readableContestSelections;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    verifier = new av_verifier_1.AVVerifier(test_helpers_2.bulletinBoardHost + 'us');
                    client = new av_client_1.AVClient(test_helpers_2.bulletinBoardHost + 'us');
                    return [4 /*yield*/, verifier.initialize()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, client.initialize(undefined, {
                            privateKey: 'bcafc67ca4af6b462f60d494adb675d8b1cf57b16dfd8d110bbc2453709999b0',
                            publicKey: '03b87d7fe793a621df27f44c20f460ff711d55545c58729f20b3fb6e871c53c49c'
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, placeVote(client)];
                case 3:
                    trackingCode = _a.sent();
                    return [4 /*yield*/, verifier.findBallot(trackingCode)
                        // The verifier starts polling for spoil request
                    ];
                case 4:
                    _a.sent();
                    pollForSpoilPromise = verifier.pollForSpoilRequest()
                        .then(function (verifierSpoilRequestAddress) {
                        return verifier.submitVerifierKey(verifierSpoilRequestAddress);
                    });
                    return [4 /*yield*/, client.spoilBallot()];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, Promise.all([pollForSpoilPromise])];
                case 6:
                    verfierPairingCode = (_a.sent())[0];
                    return [4 /*yield*/, client.waitForVerifierRegistration()];
                case 7:
                    clientPairingCode = _a.sent();
                    verifierPairingCode = verfierPairingCode;
                    // Emulating a pairing the app and verifier tracking codes
                    (0, chai_1.expect)(verifierPairingCode).to.eql(clientPairingCode);
                    // App creates the voterCommitmentOpening
                    return [4 /*yield*/, client.challengeBallot()];
                case 8:
                    // App creates the voterCommitmentOpening
                    _a.sent();
                    return [4 /*yield*/, verifier.pollForCommitmentOpening()
                        // The verifier decrypts the ballot
                    ];
                case 9:
                    _a.sent();
                    contestSelections = verifier.decryptBallot();
                    (0, chai_1.expect)(contestSelections).to.eql([
                        {
                            reference: 'contest ref 1',
                            optionSelections: [{ reference: 'option ref 1' }]
                        }, {
                            reference: 'contest ref 2',
                            optionSelections: [{ reference: 'option ref 3' }]
                        }
                    ]);
                    readableContestSelections = verifier.getReadableContestSelections(contestSelections, "en");
                    (0, chai_1.expect)(readableContestSelections).to.deep.equal([
                        {
                            "reference": "contest ref 1",
                            "title": "First ballot",
                            "optionSelections": [
                                {
                                    "reference": "option ref 1",
                                    "title": "Option 1"
                                }
                            ]
                        },
                        {
                            "reference": "contest ref 2",
                            "title": "Second ballot",
                            "optionSelections": [
                                {
                                    "reference": "option ref 3",
                                    "title": "Option 3"
                                }
                            ]
                        }
                    ]);
                    return [2 /*return*/];
            }
        });
    }); }).timeout(10000);
    function placeVote(client) {
        return __awaiter(this, void 0, void 0, function () {
            var voterId, voterEmail, oneTimePassword, contestConfigs, ballotConfig, ballotSelection, trackingCode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        voterId = Math.random().toString();
                        voterEmail = 'dev@assemblyvoting.com';
                        return [4 /*yield*/, client.requestAccessCode(voterId, voterEmail).catch(function (e) {
                                console.error(e);
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, extractOTPFromEmail()];
                    case 2:
                        oneTimePassword = _a.sent();
                        return [4 /*yield*/, client.validateAccessCode(oneTimePassword).catch(function (e) {
                                console.error(e);
                            })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, client.registerVoter().catch(function (e) {
                                console.error(e);
                            })];
                    case 4:
                        _a.sent();
                        contestConfigs = client.getLatestConfig().items.contestConfigs;
                        ballotConfig = client.getVoterBallotConfig();
                        ballotSelection = dummyBallotSelection(ballotConfig, contestConfigs);
                        return [4 /*yield*/, client.constructBallot(ballotSelection).catch(function (e) {
                                console.error(e);
                            })];
                    case 5:
                        trackingCode = _a.sent();
                        return [2 /*return*/, trackingCode];
                }
            });
        });
    }
    function extractOTPFromEmail() {
        return __awaiter(this, void 0, void 0, function () {
            var messages, lastMessageId, message, otpPattern, patternMatches, code;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, sleep(500)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, axios_1.default.get("".concat(test_helpers_2.mailcatcherHost, "messages"))
                                .then(function (response) { return response.data; })];
                    case 2:
                        messages = _a.sent();
                        if (messages.length == 0) {
                            throw 'Email message with an OTP was not found';
                        }
                        lastMessageId = messages[messages.length - 1].id;
                        return [4 /*yield*/, axios_1.default.get("".concat(test_helpers_2.mailcatcherHost, "messages/").concat(lastMessageId, ".plain"))
                                .then(function (response) { return response.data; })];
                    case 3:
                        message = _a.sent();
                        otpPattern = /\d{5}/g;
                        patternMatches = otpPattern.exec(message);
                        if (!patternMatches) {
                            throw 'OTP code pattern not found in the email';
                        }
                        code = patternMatches[0];
                        return [2 /*return*/, code];
                }
            });
        });
    }
    function sleep(ms) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, ms); })];
            });
        });
    }
});
function dummyBallotSelection(ballotConfig, contestConfigs) {
    return {
        reference: ballotConfig.content.reference,
        contestSelections: ballotConfig.content.contestReferences.map(function (cr) { return dummyContestSelection(contestConfigs[cr]); })
    };
}
function dummyContestSelection(contestConfig) {
    return {
        reference: contestConfig.content.reference,
        piles: [{
                multiplier: 1,
                optionSelections: [
                    { reference: contestConfig.content.options[0].reference }
                ]
            }]
    };
}
//# sourceMappingURL=benaloh_flow.test.js.map