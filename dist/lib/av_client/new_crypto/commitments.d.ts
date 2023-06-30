import { CommitmentOpening, ContestMap } from "../types";
export declare function generateCommitment(randomizersMap: ContestMap<string[][]>): {
    commitment: string;
    randomizer: string;
};
export declare function validateCommitment(commitmentOpening: CommitmentOpening, commitment: string, customErrorMessage?: string): void;
