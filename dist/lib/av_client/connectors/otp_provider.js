"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTPProvider = void 0;
var axios_1 = require("axios");
var errors_1 = require("../errors");
var OTPProvider = /** @class */ (function () {
    function OTPProvider(baseURL, electionContextUuid, timeout) {
        if (timeout === void 0) { timeout = 10000; }
        this.createBackendClient(baseURL, timeout);
        this.electionContextUuid = electionContextUuid;
    }
    OTPProvider.prototype.requestOTPAuthorization = function (otpCode, email) {
        return this.backend.post('authorize', {
            electionContextUuid: this.electionContextUuid,
            otpCode: otpCode,
            email: email
        }).then(function (res) { return res.data.emailConfirmationToken; })
            .catch(function (error) {
            var response = error.response;
            // The request was made but no response was received
            if (error.request && !response) {
                throw new errors_1.NetworkError('Network error. Could not connect to OTP Provider.');
            }
            // If we get errors from the provider, we wrap in custom errors
            if (response && response.status === 403 && response.data) {
                if (!response.data.errorCode) {
                    throw new errors_1.UnsupportedServerReplyError("Unsupported OTP Provider error message: ".concat(JSON.stringify(error.response.data)));
                }
                var errorCode = response.data.errorCode;
                var errorMessage = response.data.errorMessage;
                switch (errorCode) {
                    case 'OTP_SESSION_TIMED_OUT':
                        throw new errors_1.AccessCodeExpired('OTP code expired');
                    case 'OTP_DOES_NOT_MATCH':
                    case 'EMAIL_DOES_NOT_MATCH_LIVE_SESSION':
                        throw new errors_1.AccessCodeInvalid('OTP code invalid');
                    default:
                        throw new errors_1.UnsupportedServerReplyError("Unsupported OTP Provider error message: ".concat(errorMessage));
                }
            }
            // If we don't understand the error, then we rethrow
            throw error;
        });
    };
    OTPProvider.prototype.createBackendClient = function (baseURL, timeout) {
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
    return OTPProvider;
}());
exports.OTPProvider = OTPProvider;
//# sourceMappingURL=otp_provider.js.map