export default class VoterAuthorizationCoordinator {
    private backend;
    constructor(baseURL: string, timeout?: number);
    createSession(opaqueVoterId: any): Promise<any>;
    startIdentification(sessionId: any): Promise<any>;
    private createBackendClient;
}
