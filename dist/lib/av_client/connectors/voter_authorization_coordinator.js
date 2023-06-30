"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var errors_1 = require("../errors");
var VoterAuthorizationCoordinator = /** @class */ (function () {
    function VoterAuthorizationCoordinator(baseURL, electionContextUuid, timeout) {
        if (timeout === void 0) { timeout = 10000; }
        this.createBackendClient(baseURL, timeout);
        this.electionContextUuid = electionContextUuid;
    }
    /**
     *
     * @param opaqueVoterId Gets
     * @returns
     */
    VoterAuthorizationCoordinator.prototype.createSession = function (opaqueVoterId, email) {
        return this.backend.post('create_session', {
            electionContextUuid: this.electionContextUuid,
            opaqueVoterId: opaqueVoterId,
            email: email
        }).catch(function (error) {
            var response = error.response;
            if (error.request && !response) {
                throw new errors_1.NetworkError('Network error. Could not connect to Voter Authorization Coordinator.');
            }
            if ([403, 500].includes(response.status) && response.data) {
                var errorCode = response.data.error_code;
                var errorMessage = response.data.error_message;
                switch (errorCode) {
                    case 'EMAIL_DOES_NOT_MATCH_VOTER_RECORD':
                        throw new errors_1.EmailDoesNotMatchVoterRecordError(errorMessage);
                    case 'COULD_NOT_CONNECT_TO_OTP_PROVIDER':
                        throw new errors_1.NetworkError(errorMessage);
                    case 'VOTER_RECORD_NOT_FOUND_ERROR':
                        throw new errors_1.VoterRecordNotFoundError(errorMessage);
                    default: throw new errors_1.UnsupportedServerReplyError("Unsupported server error: ".concat(errorMessage));
                }
            }
            throw error;
        });
    };
    VoterAuthorizationCoordinator.prototype.requestPublicKeyAuthorization = function (sessionId, identityConfirmationToken, publicKey, votingRoundReference) {
        return this.backend.post('request_authorization', {
            electionContextUuid: this.electionContextUuid,
            sessionId: sessionId,
            emailConfirmationToken: identityConfirmationToken,
            publicKey: publicKey,
            votingRoundReference: votingRoundReference
        });
    };
    VoterAuthorizationCoordinator.prototype.authorizeProofOfElectionCodes = function (publicKey, proof, votingRoundReference, scope) {
        if (scope === void 0) { scope = "register"; }
        return this.backend.post('authorize_proof', {
            scope: scope,
            electionContextUuid: this.electionContextUuid,
            voterPublicKey: proof.mainKeyPair.publicKey,
            sessionPublicKey: publicKey,
            proof: proof.proof,
            votingRoundReference: votingRoundReference
        });
    };
    VoterAuthorizationCoordinator.prototype.createBackendClient = function (baseURL, timeout) {
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
    return VoterAuthorizationCoordinator;
}());
exports.default = VoterAuthorizationCoordinator;
//# sourceMappingURL=voter_authorization_coordinator.js.map