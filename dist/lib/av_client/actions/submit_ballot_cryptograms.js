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
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitBallotCryptograms = void 0;
var sign_1 = require("../sign");
var constants_1 = require("../constants");
var aion_crypto_1 = require("../aion_crypto");
var finalize_cryptograms_1 = require("../new_crypto/finalize_cryptograms");
function submitBallotCryptograms(bulletinBoard, clientEnvelopes, serverEnvelopes, boardCommitmentAddress, voterPrivateKey, dbbPublicKey) {
    return __awaiter(this, void 0, void 0, function () {
        var finalizedCryptograms, ballotCryptogramsItem, signedBallotCryptogramsItem, itemWithProofs, response, ballotCryptogramsItemCopy, verificationItem, receipt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    finalizedCryptograms = (0, finalize_cryptograms_1.finalizeCryptograms)(clientEnvelopes, serverEnvelopes);
                    ballotCryptogramsItem = {
                        parentAddress: boardCommitmentAddress,
                        type: constants_1.BALLOT_CRYPTOGRAMS_ITEM,
                        content: {
                            contests: finalizedCryptograms,
                        }
                    };
                    signedBallotCryptogramsItem = (0, sign_1.signPayload)(ballotCryptogramsItem, voterPrivateKey);
                    itemWithProofs = __assign(__assign({}, signedBallotCryptogramsItem), { proofs: generateEnvelopeProofs(clientEnvelopes) });
                    return [4 /*yield*/, bulletinBoard.submitVotes(itemWithProofs)];
                case 1:
                    response = (_a.sent());
                    ballotCryptogramsItemCopy = response.data.vote;
                    verificationItem = response.data.verification;
                    receipt = response.data.receipt;
                    (0, sign_1.validatePayload)(ballotCryptogramsItemCopy, ballotCryptogramsItem);
                    (0, sign_1.validateReceipt)([ballotCryptogramsItemCopy, verificationItem], receipt, dbbPublicKey);
                    return [2 /*return*/, [
                            ballotCryptogramsItemCopy,
                            verificationItem
                        ]];
            }
        });
    });
}
exports.submitBallotCryptograms = submitBallotCryptograms;
function generateEnvelopeProofs(contestEnvelopes) {
    var entries = contestEnvelopes.map(function (ce) {
        var envelopeProofs = ce.piles.map(function (p) {
            return p.randomizers.map(function (r) { return (0, aion_crypto_1.generateDiscreteLogarithmProof)(r); });
        });
        return [ce.reference, envelopeProofs];
    });
    return Object.fromEntries(entries);
}
//# sourceMappingURL=submit_ballot_cryptograms.js.map