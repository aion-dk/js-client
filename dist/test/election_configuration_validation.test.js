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
/*eslint-disable @typescript-eslint/no-explicit-any*/
var av_client_1 = require("../lib/av_client");
var test_helpers_1 = require("./test_helpers");
var errors_1 = require("../lib/av_client/errors");
var latestConfig_1 = require("./fixtures/latestConfig");
describe('election configuration validation', function () {
    var client;
    var config = latestConfig_1.default;
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            client = new av_client_1.AVClient('http://nothing.local');
            return [2 /*return*/];
        });
    }); });
    context('OTP provider URL is empty', function () {
        it('fails with an error', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config.items.voterAuthorizerConfig.content.identityProvider.url = '';
                        return [4 /*yield*/, (0, test_helpers_1.expectError)(client.initialize(config), errors_1.InvalidConfigError, 'Received invalid election configuration. Errors: Configuration is missing OTP Provider URL')];
                    case 1:
                        _a.sent();
                        latestConfig_1.default.items.voterAuthorizerConfig.content.identityProvider.url = 'http://otp:3001';
                        return [2 /*return*/];
                }
            });
        }); });
    });
    context('Voter Authorizer URL is empty', function () {
        it('fails with an error', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config.items.voterAuthorizerConfig.content.voterAuthorizer.url = '';
                        return [4 /*yield*/, (0, test_helpers_1.expectError)(client.initialize(config), errors_1.InvalidConfigError, 'Received invalid election configuration. Errors: Configuration is missing Voter Authorizer URL')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    context('services key is missing', function () {
        it('fails with an error', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        delete config.items.voterAuthorizerConfig;
                        return [4 /*yield*/, (0, test_helpers_1.expectError)(client.initialize(config), errors_1.InvalidConfigError, "Received invalid election configuration. Errors: Configuration is missing OTP Provider URL,\n" +
                                "Configuration is missing OTP Provider election context uuid,\n" +
                                "Configuration is missing OTP Provider public key,\n" +
                                "Configuration is missing Voter Authorizer URL,\n" +
                                "Configuration is missing Voter Authorizer election context uuid,\n" +
                                "Configuration is missing Voter Authorizer public key")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=election_configuration_validation.test.js.map