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
exports.expectError = exports.deterministicMathRandom = exports.resetDeterministicOffset = exports.deterministicRandomWords = exports.resetDeterminism = exports.OTPProviderElectionContextId = exports.mailcatcherHost = exports.OTPProviderHost = exports.voterAuthorizerHost = exports.conferenceHost = exports.bulletinBoardHost = void 0;
/*eslint-disable @typescript-eslint/no-explicit-any*/
var chai_1 = require("chai");
var sinon = require("sinon");
var sjcl = require("../lib/av_client/sjcl");
require("dotenv/config");
function getEnvVar(name) {
    var variable = process.env[name];
    if (variable)
        return variable;
    throw new Error("Missing expected environment variable ".concat(name));
}
exports.bulletinBoardHost = getEnvVar('DBB_URL');
exports.conferenceHost = getEnvVar('CONFERENCE_HOST_URL');
exports.voterAuthorizerHost = getEnvVar('VOTER_AUTHORIZER_URL');
exports.OTPProviderHost = getEnvVar('OTP_PROVIDER_URL');
exports.mailcatcherHost = getEnvVar('MAILCATCHER_URL');
exports.OTPProviderElectionContextId = 'cca2b217-cedd-4d58-a103-d101ba472eb8';
function resetDeterminism() {
    var sandbox = sinon.createSandbox();
    sandbox.stub(Math, 'random').callsFake(deterministicMathRandom);
    sandbox.stub(sjcl.prng.prototype, 'randomWords').callsFake(deterministicRandomWords);
    resetDeterministicOffset();
    return sandbox;
}
exports.resetDeterminism = resetDeterminism;
function deterministicRandomWords(nwords, _paranoia) {
    var lowestValidNumber = -2147483648;
    var highestValidNumber = 2147483647;
    if (typeof global.deterministicOffset == 'undefined') {
        resetDeterministicOffset();
    }
    var nextRandomInt = global.deterministicOffset;
    var output = [];
    for (var i = 0; i < nwords; i++) {
        if (nextRandomInt > highestValidNumber) {
            nextRandomInt = lowestValidNumber;
        }
        output.push(nextRandomInt++);
    }
    global.deterministicOffset++;
    return output;
}
exports.deterministicRandomWords = deterministicRandomWords;
function resetDeterministicOffset() {
    global.deterministicOffset = 0;
}
exports.resetDeterministicOffset = resetDeterministicOffset;
// Make Math.random deterministic when running tests
function deterministicMathRandom() {
    return 0.42;
}
exports.deterministicMathRandom = deterministicMathRandom;
function expectError(promise, errorType, message) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (typeof promise == 'object') { // Async promise
                return [2 /*return*/, promise
                        .then(function () { return chai_1.expect.fail('Expected promise to be rejected'); })
                        .catch(function (error) {
                        (0, chai_1.expect)(error).to.be.an.instanceof(errorType);
                        (0, chai_1.expect)(error.message).to.equal(message);
                    })];
            }
            else if (typeof promise == 'function') { // Synchronous function
                (0, chai_1.expect)(function () { return promise(); }).to.throw(errorType, message);
            }
            return [2 /*return*/];
        });
    });
}
exports.expectError = expectError;
//# sourceMappingURL=test_helpers.js.map