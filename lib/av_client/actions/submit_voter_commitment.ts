import { BulletinBoard } from "../connectors/bulletin_board";
import { signPayload, validatePayload } from "../sign";
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
  dbbPublicKey?: string): Promise<SubmitVoterCommitmentResponse> => {

  const commitmentItem = {
    parentAddress: sessionAddress,
    type: "VoterEncryptionCommitmentItem",
    content: {
      commitment: commitment
    }
  };

  const signedCommitmentItem = signPayload(commitmentItem, voterSigningKey);
  const response = await bulletinBoard.submitCommitment(signedCommitmentItem);

  const voterCommitment: VoterCommitmentItem = response.data.voterCommitment;
  const boardCommitment = response.data.boardCommitment;
  const serverEnvelopes = response.data.envelopes;

  const voterCommitmentItemExpectation = {
    parentAddress: sessionAddress,
    type: "VoterEncryptionCommitmentItem" as BoardItemType,
    content: {
      commitment: commitment
    }
  }

  validatePayload(voterCommitment, voterCommitmentItemExpectation)

  const boardCommitmentItemExpectation = {
    parentAddress: voterCommitment.address,
    type: "BoardEncryptionCommitmentItem" as BoardItemType,
  }

  validatePayload(boardCommitment, boardCommitmentItemExpectation, dbbPublicKey)

  return {
    voterCommitment,
    boardCommitment, 
    serverEnvelopes
  }
}

export default submitVoterCommitment;
