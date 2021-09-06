"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTPProvider = void 0;
const axios_1 = require("axios");
const errors_1 = require("../errors");
class OTPProvider {
    constructor(baseURL, timeout = 1000) {
        this.createBackendClient(baseURL, timeout);
    }
    requestOTPAuthorization(otpCode, email) {
        return this.backend.post('authorize', {
            otp_code: otpCode,
            email: email
        }).then(res => res.data) // Transform the return type to a Token
            .catch(error => {
            // If we get errors from the provider, we wrap in custom errors
            if (error.response && error.response.status === 403) {
                const _error = error.response.data.error; // TODO: revert to error.response.data?.error
                if (_error === 'expired') {
                    throw new errors_1.AccessCodeExpired('OTP code expired');
                }
                if (_error === 'invalid') {
                    throw new errors_1.AccessCodeInvalid('OTP code invalid');
                }
            }
            // The request was made but no response was received
            if (error.request && !error.response) {
                throw new errors_1.NetworkError('Network error');
            }
            // If we don't understand the error, then we rethrow
            throw error;
        });
    }
    createBackendClient(baseURL, timeout) {
        this.backend = axios_1.default.create({
            baseURL: baseURL,
            withCredentials: false,
            timeout: timeout,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });
    }
}
exports.OTPProvider = OTPProvider;
//# sourceMappingURL=otp_provider.js.map