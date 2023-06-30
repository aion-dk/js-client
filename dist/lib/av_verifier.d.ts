import { ContestSelection, ReadableContestSelection, LatestConfig } from './av_client/types';
export declare class AVVerifier {
    private dbbPublicKey;
    private verifierPrivateKey;
    private cryptogramAddress;
    private verifierItem;
    private voterCommitment;
    private boardCommitment;
    private ballotCryptograms;
    private boardCommitmentOpening;
    private voterCommitmentOpening;
    private latestConfig;
    private bulletinBoard;
    /**
     * @param bulletinBoardURL URL to the Assembly Voting backend server, specific for election.
     */
    constructor(bulletinBoardURL: string, dbbPublicKey?: string);
    /**
     * Initializes the client with an election config.
     * If no config is provided, it fetches one from the backend.
     *
     * @param electionConfig Allows injection of an election configuration for testing purposes
     * @param keyPair Allows injection of a keypair to support automatic testing
     * @returns Returns undefined if succeeded or throws an error
     * @throws {@link NetworkError | NetworkError } if any request failed to get a response
     */
    initialize(latestConfig?: LatestConfig): Promise<void>;
    findBallot(trackingCode: string): Promise<string>;
    submitVerifierKey(spoilRequestAddress: string): Promise<string>;
    decryptBallot(): ContestSelection[];
    pollForSpoilRequest(): Promise<string>;
    getReadableContestSelections(contestSelections: ContestSelection[], locale: string): ReadableContestSelection[];
    async: any;
    pollForCommitmentOpening(): Promise<unknown>;
}
