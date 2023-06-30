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
exports.BulletinBoard = void 0;
var axios_1 = require("axios");
var errors_1 = require("../errors");
var BulletinBoard = /** @class */ (function () {
    function BulletinBoard(baseURL, timeout) {
        if (timeout === void 0) { timeout = 10000; }
        this.createBackendClient(baseURL, timeout);
    }
    BulletinBoard.prototype.setVoterSessionUuid = function (voterSessionUuid) {
        this.voterSessionUuid = voterSessionUuid;
    };
    BulletinBoard.prototype.getLatestConfig = function () {
        return this.backend.get('configuration/latest_config');
    };
    // Voting
    BulletinBoard.prototype.createVoterRegistration = function (authToken, parentAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.backend.post('voting/registrations', {
                            authToken: authToken,
                            parentAddress: parentAddress
                        }).catch(function (error) {
                            var response = error.response;
                            if (error.request && !response) {
                                throw new errors_1.NetworkError('Network error. Could not connect to Bulletin Board.');
                            }
                            if ([403, 500].includes(response.status) && response.data) {
                                if (!response.data.error || !response.data.error.code || !response.data.error.description) {
                                    throw new errors_1.UnsupportedServerReplyError("Unsupported Bulletin Board server error message: ".concat(JSON.stringify(error.response.data)));
                                }
                                var errorMessage = response.data.error.description;
                                throw new errors_1.BulletinBoardError(errorMessage);
                            }
                            throw error;
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response];
                }
            });
        });
    };
    BulletinBoard.prototype.expireVoterSessions = function (authToken, parentAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.backend.post('voting/expirations', {
                            expToken: authToken,
                            parentAddress: parentAddress
                        }).catch(function (error) {
                            var response = error.response;
                            if (error.request && !response) {
                                throw new errors_1.NetworkError('Network error. Could not connect to Bulletin Board.');
                            }
                            if ([403, 500].includes(response.status) && response.data) {
                                if (!response.data.error || !response.data.error.code || !response.data.error.description) {
                                    throw new errors_1.UnsupportedServerReplyError("Unsupported Bulletin Board server error message: ".concat(JSON.stringify(error.response.data)));
                                }
                                var errorMessage = response.data.error.description;
                                throw new errors_1.BulletinBoardError(errorMessage);
                            }
                            throw error;
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response];
                }
            });
        });
    };
    BulletinBoard.prototype.submitVotes = function (signedBallotCryptogramsItem) {
        return this.backend.post('voting/votes', { vote: signedBallotCryptogramsItem }, {
            headers: {
                'X-Voter-Session': this.voterSessionUuid
            }
        });
    };
    BulletinBoard.prototype.submitCommitment = function (signedCommitmentItem) {
        return this.backend.post('voting/commitments', { commitment: signedCommitmentItem }, {
            headers: {
                'X-Voter-Session': this.voterSessionUuid
            }
        });
    };
    BulletinBoard.prototype.submitCastRequest = function (signedCastRequestItem) {
        return this.backend.post('voting/cast', { castRequest: signedCastRequestItem }, {
            headers: {
                'X-Voter-Session': this.voterSessionUuid
            }
        });
    };
    BulletinBoard.prototype.submitSpoilRequest = function (signedSpoilRequestItem) {
        return this.backend.post('voting/spoil', { spoilRequest: signedSpoilRequestItem }, {
            headers: {
                'X-Voter-Session': this.voterSessionUuid
            }
        });
    };
    // Verification
    BulletinBoard.prototype.getVotingTrack = function (shortAddress) {
        return this.backend.get("verification/vote_track?id=".concat(shortAddress));
    };
    BulletinBoard.prototype.getCommitmentOpenings = function (verifierItemAddress) {
        return this.backend.get("verification/commitment_openings?id=".concat(verifierItemAddress));
    };
    BulletinBoard.prototype.getSpoilRequestItem = function (ballotCryptogramAddress) {
        return this.backend.get("verification/spoil_status?id=".concat(ballotCryptogramAddress));
    };
    BulletinBoard.prototype.getVerifierItem = function (spoilRequestAddress) {
        return this.backend.get("verification/verifiers/".concat(spoilRequestAddress));
    };
    BulletinBoard.prototype.submitVerifierItem = function (signedVerifierItem) {
        return this.backend.post('verification/verifiers', { verifier: signedVerifierItem });
    };
    BulletinBoard.prototype.submitCommitmentOpenings = function (signedVoterCommitmentOpeningItem) {
        return this.backend.post('verification/commitment_openings', { commitmentOpening: signedVoterCommitmentOpeningItem }, {
            headers: {
                'X-Voter-Session': this.voterSessionUuid
            }
        });
    };
    BulletinBoard.prototype.getBallotStatus = function (shortAddress) {
        return this.backend.get("ballot_status?trackingCode=".concat(shortAddress));
    };
    BulletinBoard.prototype.createBackendClient = function (baseURL, timeout) {
        this.backend = axios_1.default.create({
            baseURL: baseURL,
            withCredentials: false,
            timeout: timeout,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });
    };
    return BulletinBoard;
}());
exports.BulletinBoard = BulletinBoard;
//# sourceMappingURL=bulletin_board.js.map