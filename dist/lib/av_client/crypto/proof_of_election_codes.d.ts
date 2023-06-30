import { KeyPair } from "../types";
export declare class ProofOfElectionCodes {
    readonly proof: string;
    readonly mainKeyPair: KeyPair;
    constructor(electionCodes: Array<string>);
}
