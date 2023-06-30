import { AxiosResponse } from 'axios';
export declare class BulletinBoard {
    private backend;
    voterSessionUuid: string;
    constructor(baseURL: string, timeout?: number);
    setVoterSessionUuid(voterSessionUuid: string): void;
    getLatestConfig(): Promise<AxiosResponse>;
    createVoterRegistration(authToken: string, parentAddress: string): Promise<AxiosResponse>;
    expireVoterSessions(authToken: string, parentAddress: string): Promise<AxiosResponse>;
    submitVotes(signedBallotCryptogramsItem: any): Promise<AxiosResponse>;
    submitCommitment(signedCommitmentItem: any): Promise<AxiosResponse>;
    submitCastRequest(signedCastRequestItem: any): Promise<AxiosResponse>;
    submitSpoilRequest(signedSpoilRequestItem: any): Promise<AxiosResponse>;
    getVotingTrack(shortAddress: string): Promise<AxiosResponse>;
    getCommitmentOpenings(verifierItemAddress: string): Promise<AxiosResponse>;
    getSpoilRequestItem(ballotCryptogramAddress: string): Promise<AxiosResponse>;
    getVerifierItem(spoilRequestAddress: string): Promise<AxiosResponse>;
    submitVerifierItem(signedVerifierItem: any): Promise<AxiosResponse>;
    submitCommitmentOpenings(signedVoterCommitmentOpeningItem: any): Promise<AxiosResponse>;
    getBallotStatus(shortAddress: any): Promise<AxiosResponse>;
    private createBackendClient;
}
