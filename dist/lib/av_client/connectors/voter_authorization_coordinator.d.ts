import { AxiosResponse } from 'axios';
import { IdentityConfirmationToken } from "./otp_provider";
import { ProofOfElectionCodes } from "../crypto/proof_of_election_codes";
export default class VoterAuthorizationCoordinator {
    private backend;
    private electionContextUuid;
    constructor(baseURL: string, electionContextUuid: string, timeout?: number);
    /**
     *
     * @param opaqueVoterId Gets
     * @returns
     */
    createSession(opaqueVoterId: string, email: string): Promise<AxiosResponse>;
    requestPublicKeyAuthorization(sessionId: string, identityConfirmationToken: IdentityConfirmationToken, publicKey: string, votingRoundReference: string): Promise<AxiosResponse>;
    authorizeProofOfElectionCodes(publicKey: string, proof: ProofOfElectionCodes, votingRoundReference: string, scope?: string): Promise<AxiosResponse>;
    private createBackendClient;
}
