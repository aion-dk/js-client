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
exports.validateLatestConfig = exports.fetchLatestConfig = void 0;
var errors_1 = require("./errors");
function fetchLatestConfig(bulletinBoard) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, bulletinBoard.getLatestConfig()
                    .then(function (response) {
                    var configData = response.data;
                    // const privKey = 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'
                    var pubKey = '03e9858b6e48eb93d8f27aa76b60806298c4c7dd94077ad6c3ff97c44937888647';
                    configData.affidavit = {
                        curve: 'k256',
                        encryptionKey: pubKey
                    };
                    return configData;
                })
                    .catch(function (error) {
                    console.error();
                    throw error;
                })];
        });
    });
}
exports.fetchLatestConfig = fetchLatestConfig;
function validateLatestConfig(config) {
    var errors = [];
    if (!containsOTPProviderURL(config)) {
        errors.push("Configuration is missing OTP Provider URL");
    }
    if (!containsOTPProviderContextId(config)) {
        errors.push("Configuration is missing OTP Provider election context uuid");
    }
    if (!containsOTPProviderPublicKey(config)) {
        errors.push("Configuration is missing OTP Provider public key");
    }
    if (!containsVoterAuthorizerURL(config)) {
        errors.push("Configuration is missing Voter Authorizer URL");
    }
    if (!containsVoterAuthorizerContextId(config)) {
        errors.push("Configuration is missing Voter Authorizer election context uuid");
    }
    if (!containsVoterAuthorizerPublicKey(config)) {
        errors.push("Configuration is missing Voter Authorizer public key");
    }
    if (errors.length > 0)
        throw new errors_1.InvalidConfigError("Received invalid election configuration. Errors: ".concat(errors.join(",\n")));
}
exports.validateLatestConfig = validateLatestConfig;
function containsOTPProviderURL(config) {
    var _a, _b, _c, _d, _e;
    return ((_e = (_d = (_c = (_b = (_a = config === null || config === void 0 ? void 0 : config.items) === null || _a === void 0 ? void 0 : _a.voterAuthorizerConfig) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.identityProvider) === null || _d === void 0 ? void 0 : _d.url) === null || _e === void 0 ? void 0 : _e.length) > 0;
}
function containsOTPProviderContextId(config) {
    var _a, _b, _c, _d, _e;
    return ((_e = (_d = (_c = (_b = (_a = config === null || config === void 0 ? void 0 : config.items) === null || _a === void 0 ? void 0 : _a.voterAuthorizerConfig) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.identityProvider) === null || _d === void 0 ? void 0 : _d.contextUuid) === null || _e === void 0 ? void 0 : _e.length) > 0;
}
function containsOTPProviderPublicKey(config) {
    var _a, _b, _c, _d, _e;
    return ((_e = (_d = (_c = (_b = (_a = config === null || config === void 0 ? void 0 : config.items) === null || _a === void 0 ? void 0 : _a.voterAuthorizerConfig) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.identityProvider) === null || _d === void 0 ? void 0 : _d.publicKey) === null || _e === void 0 ? void 0 : _e.length) > 0;
}
function containsVoterAuthorizerURL(config) {
    var _a, _b, _c, _d, _e;
    return ((_e = (_d = (_c = (_b = (_a = config === null || config === void 0 ? void 0 : config.items) === null || _a === void 0 ? void 0 : _a.voterAuthorizerConfig) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.voterAuthorizer) === null || _d === void 0 ? void 0 : _d.url) === null || _e === void 0 ? void 0 : _e.length) > 0;
}
function containsVoterAuthorizerContextId(config) {
    var _a, _b, _c, _d, _e;
    return ((_e = (_d = (_c = (_b = (_a = config === null || config === void 0 ? void 0 : config.items) === null || _a === void 0 ? void 0 : _a.voterAuthorizerConfig) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.voterAuthorizer) === null || _d === void 0 ? void 0 : _d.contextUuid) === null || _e === void 0 ? void 0 : _e.length) > 0;
}
function containsVoterAuthorizerPublicKey(config) {
    var _a, _b, _c, _d, _e;
    return ((_e = (_d = (_c = (_b = (_a = config === null || config === void 0 ? void 0 : config.items) === null || _a === void 0 ? void 0 : _a.voterAuthorizerConfig) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.voterAuthorizer) === null || _d === void 0 ? void 0 : _d.publicKey) === null || _e === void 0 ? void 0 : _e.length) > 0;
}
//# sourceMappingURL=election_config.js.map