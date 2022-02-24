import { BulletinBoard } from "../connectors/bulletin_board";
import { BOARD_COMMITMENT_ITEM, VOTER_COMMITMENT_ITEM } from "../constants";
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
    type: VOTER_COMMITMENT_ITEM,
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
    type: VOTER_COMMITMENT_ITEM as BoardItemType,
    content: {
      commitment: commitment
    }
  }

  validatePayload(voterCommitment, voterCommitmentItemExpectation)

  const boardCommitmentItemExpectation = {
    parentAddress: voterCommitment.address,
    type: BOARD_COMMITMENT_ITEM as BoardItemType,
  }

  validatePayload(boardCommitment, boardCommitmentItemExpectation, dbbPublicKey)

  return {
    voterCommitment,
    boardCommitment, 
    serverEnvelopes
  }
}

export default submitVoterCommitment;
