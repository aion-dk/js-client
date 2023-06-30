import { ContestConfigMap, ContestSelection, ContestMap, CommitmentOpening, SealedPile } from "../types";
export declare function decryptContestSelections(contestConfigs: ContestConfigMap, encryptionKey: string, contests: ContestMap<SealedPile[]>, boardCommitmentOpening: CommitmentOpening, voterCommitmentOpening: CommitmentOpening): ContestSelection[];
