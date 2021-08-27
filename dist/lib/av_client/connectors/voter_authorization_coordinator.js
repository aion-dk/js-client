"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios = require('axios');
class VoterAuthorizationCoordinator {
    constructor(baseURL, timeout = 1000) {
        this.createBackendClient(baseURL, timeout);
    }
    createSession(opaqueVoterId) {
        return this.backend.post('create_session', {
            opaque_voter_id: opaqueVoterId
        });
    }
    startIdentification(sessionId) {
        return this.backend.post('start_identification', {
            session_id: sessionId
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