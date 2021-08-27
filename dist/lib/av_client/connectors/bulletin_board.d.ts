export default class BulletinBoard {
    private backend;
    voterAuthorizationCoordinator: any;
    voterSessionUuid: string;
    constructor(baseURL: string, timeout?: number);
    setVoterSessionUuid(voterSessionUuid: any): void;
    getElectionConfig(): any;
    createSession(publicKey: any, signature: any): any;
    registerVoter(publicKey: any, signature: any): any;
    challengeEmptyCryptograms(challenges: any): any;
    getRandomizers(): any;
    getCommitmentOpening(voterCommitmentOpening: any, encryptedBallotCryptograms: any): any;
    getBoardHash(): any;
    submitVotes(contentHash: any, signature: any, cryptogramsWithProofs: any): any;
    private createBackendClient;
}
