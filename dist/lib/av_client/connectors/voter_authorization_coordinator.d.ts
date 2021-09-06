import { IdentityConfirmationToken } from "./otp_provider";
export default class VoterAuthorizationCoordinator {
    private backend;
    constructor(baseURL: string, timeout?: number);
    /**
     *
     * @param opaqueVoterId Gets
     * @returns
     */
    createSession(opaqueVoterId: string, email: string): Promise<any>;
    startIdentification(sessionId: any): Promise<any>;
    requestPublicKeyAuthorization(sessionId: string, identityConfirmationToken: IdentityConfirmationToken, publicKey: string): any;
    private createBackendClient;
}
