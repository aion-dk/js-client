"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios = require('axios');
class VoterAuthorizationCoordinator {
    constructor(baseURL, timeout = 1000) {
        this.createBackendClient(baseURL, timeout);
    }
    /**
     *
     * @param opaqueVoterId Gets
     * @returns
     */
    createSession(opaqueVoterId, email) {
        return this.backend.post('create_session', {
            opaque_voter_id: opaqueVoterId,
            email
        });
    }
    startIdentification(sessionId) {
        return this.backend.post('start_identification', {
            session_id: sessionId
        });
    }
    requestPublicKeyAuthorization(sessionId, identityConfirmationToken, publicKey) {
        return this.backend.post('request_authorization', {
            session_id: sessionId,
            identity_confirmation_token: identityConfirmationToken,
            public_key: publicKey
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
exports.default = VoterAuthorizationCoordinator;
//# sourceMappingURL=voter_authorization_coordinator.js.map