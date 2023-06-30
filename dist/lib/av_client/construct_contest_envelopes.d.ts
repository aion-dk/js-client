import { BallotSelection, ContestEnvelope, ContestMap, ClientState } from './types';
export declare function constructContestEnvelopes(state: ClientState, ballotSelection: BallotSelection): ConstructResult;
declare type ConstructResult = {
    pedersenCommitment: {
        commitment: string;
        randomizer: string;
    };
    envelopeRandomizers: ContestMap<string[][]>;
    contestEnvelopes: ContestEnvelope[];
};
export {};
