import { ContestConfigMap, ContestEnvelope, ContestSelection } from "../types";
export declare function encryptContestSelections(contestConfigs: ContestConfigMap, contestSelections: ContestSelection[], encryptionKey: string): ContestEnvelope[];
