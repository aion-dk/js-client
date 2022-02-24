import { BulletinBoard } from "../connectors/bulletin_board";
import { signPayload, validatePayload, validateReceipt } from "../sign";
import { BoardCommitmentItem, BoardItemType, ContestMap, VoterCommitmentItem } from "../types";

type SubmitVoterCommitmentResponse = {
  voterCommitment: VoterCommitmentItem
  boardCommitment: BoardCommitmentItem
  serverEnvelopes: ContestMap<string[]>
}

const submitVoterCommitment = async (
  bulletinBoard: BulletinBoard,
  sessionAddress: string,
  commitment: string,
  voterSigningKey: string,
  dbbPublicKey: string): Promise<SubmitVoterCommitmentResponse> => {

  const voterCommitmentItem = {
    parentAddress: sessionAddress,
    type: "VoterEncryptionCommitmentItem"  as BoardItemType,
    content: {
      commitment: commitment
    }
  };

  const signedCommitmentItem = signPayload(voterCommitmentItem, voterSigningKey);
  const response = await bulletinBoard.submitCommitment(signedCommitmentItem);

  const voterCommitmentCopy: VoterCommitmentItem = response.data.voterCommitment;
  const boardCommitment = response.data.boardCommitment;
  const serverEnvelopes = response.data.envelopes;
  const receipt = response.data.receipt;


  validatePayload(voterCommitmentCopy, voterCommitmentItem);

  const boardCommitmentItemExpectation = {
    parentAddress: voterCommitmentCopy.address,
    type: "BoardEncryptionCommitmentItem" as BoardItemType,
  }

  validatePayload(boardCommitment, boardCommitmentItemExpectation, dbbPublicKey)
  validateReceipt([voterCommitmentCopy, boardCommitment], receipt, dbbPublicKey);

  return {
    voterCommitment: voterCommitmentCopy,
    boardCommitment, 
    serverEnvelopes
  }
}

export default submitVoterCommitment;
