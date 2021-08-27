"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios = require('axios');
class OTPProvider {
    constructor(baseURL, timeout = 1000) {
        this.createBackendClient(baseURL, timeout);
    }
    requestOTPAuthorization(otpCode, email) {
        return this.backend.post('authorize', {
            otp_code: otpCode,
            email: email
        });
    }
    createBackendClient(baseURL, timeout) {
        this.backend = axios.create({
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
exports.default = OTPProvider;
//# sourceMappingURL=otp_provider.js.map