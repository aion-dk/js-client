import { ContestIndexed } from "./types";
import { Ballot } from './election_config';
interface EmptyCryptogram {
    commitment: string;
    cryptogram: string;
}
interface RegisterVoterResponse {
    voterSessionUuid: string;
    voterIdentifier: string;
    emptyCryptograms: ContestIndexed<EmptyCryptogram>;
    ballots: Ballot[];
}
export declare function registerVoter(bulletinBoard: any, keyPair: any, electionEncryptionKey: any, voterRecord: any, authorizationToken: any): Promise<RegisterVoterResponse>;
export {};
