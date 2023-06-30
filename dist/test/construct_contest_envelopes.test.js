"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var construct_contest_envelopes_1 = require("../lib/av_client/construct_contest_envelopes");
var latestConfig_1 = require("./fixtures/latestConfig");
var itemHelper_1 = require("./fixtures/itemHelper");
var contestOne = __assign(__assign({}, (0, itemHelper_1.baseItemAttributes)()), { type: 'ContestConfigItem', content: {
        reference: 'contest-1',
        markingType: {
            minMarks: 1,
            maxMarks: 1,
            blankSubmission: "disabled",
            encoding: {
                codeSize: 1,
                maxSize: 1,
                cryptogramCount: 1
            }
        },
        resultType: {
            name: 'does not matter right now'
        },
        title: { en: 'Contest 1' },
        subtitle: { en: 'Contest 1' },
        description: { en: 'Contest 1' },
        options: [
            {
                reference: 'option-1',
                code: 1,
                title: { en: 'Option 1' },
                subtitle: { en: 'Option 1' },
                description: { en: 'Option 1' },
            }
        ]
    } });
var ballotOne = __assign(__assign({}, (0, itemHelper_1.baseItemAttributes)()), { type: 'BallotConfigItem', content: {
        reference: 'ballot-1',
        voterGroup: '1',
        contestReferences: ['contest-1']
    } });
var votingRoundConfig = {
    address: "",
    author: "",
    parentAddress: "",
    previousAddress: "",
    content: {
        status: "open",
        reference: "voting-round-1",
        contestReferences: [
            'contest-1',
            'contest-2'
        ]
    },
    registeredAt: "2023-01-11T09:27:11.397Z",
    signature: "120e0bf80ad403fdd07b9accf19aa5f4fbc5746424e552b22cf9c93f1c06f815,0de6cc49f0bb8d4680cc1039e2ce983bd9ee002b3cea196e12efb43eababf5c8",
    type: "VotingRoundConfigItem"
};
var clientState = {
    latestConfig: {
        items: {
            thresholdConfig: latestConfig_1.default.items.thresholdConfig,
            ballotConfigs: (_a = {},
                _a[ballotOne.content.voterGroup] = ballotOne,
                _a),
            contestConfigs: (_b = {},
                _b[contestOne.content.reference] = contestOne,
                _b),
            votingRoundConfigs: (_c = {},
                _c[votingRoundConfig.content.reference] = votingRoundConfig,
                _c),
            voterAuthorizerConfig: latestConfig_1.default.items.voterAuthorizerConfig,
            electionConfig: latestConfig_1.default.items.electionConfig,
            genesisConfig: latestConfig_1.default.items.genesisConfig,
            latestConfigItem: latestConfig_1.default.items.latestConfigItem,
            segmentsConfig: null
        }
    },
    voterSession: __assign(__assign({}, (0, itemHelper_1.baseItemAttributes)()), { content: {
            authToken: "string",
            identifier: "string",
            publicKey: "string",
            votingRoundReference: "string",
            weight: 1,
            voterGroup: '1'
        }, type: "VoterSessionItem" }),
    votingRoundReference: "voting-round-1"
};
var ballotSelection = {
    reference: 'ballot-1',
    contestSelections: [
        {
            reference: 'contest-1',
            piles: [{
                    multiplier: 1,
                    optionSelections: [
                        { reference: 'option-1' }
                    ]
                }]
        }
    ]
};
describe('constructContestEnvelopes', function () {
    context('when given a valid arguments', function () {
        it('encrypts without errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                result = (0, construct_contest_envelopes_1.constructContestEnvelopes)(clientState, ballotSelection);
                (0, chai_1.expect)(result).to.have.keys('pedersenCommitment', 'envelopeRandomizers', 'contestEnvelopes');
                return [2 /*return*/];
            });
        }); });
    });
});
//# sourceMappingURL=construct_contest_envelopes.test.js.map