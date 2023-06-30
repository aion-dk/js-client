import { BulletinBoard } from "../connectors/bulletin_board";
import { BoardCommitmentItem, ContestMap, VoterCommitmentItem } from "../types";
declare type SubmitVoterCommitmentResponse = {
    voterCommitment: VoterCommitmentItem;
    boardCommitment: BoardCommitmentItem;
    serverEnvelopes: ContestMap<string[][]>;
};
declare const submitVoterCommitment: (bulletinBoard: BulletinBoard, sessionAddress: string, commitment: string, voterSigningKey: string, pilesPerContest: ContestMap<number>, dbbPublicKey: string) => Promise<SubmitVoterCommitmentResponse>;
export default submitVoterCommitment;
