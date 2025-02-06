import { BulletinBoard } from "../connectors/bulletin_board";
import { BOARD_COMMITMENT_ITEM, VOTER_COMMITMENT_ITEM } from "../constants";
import { signPayload, validatePayload, validateReceipt } from "../new_crypto/signing";
import { BoardCommitmentItem, ContestMap, VoterCommitmentItem } from "../types";
import {AVCrypto} from "../../av_crypto";

type SubmitVoterCommitmentResponse = {
  voterCommitment: VoterCommitmentItem
  boardCommitment: BoardCommitmentItem
  serverEnvelopes: ContestMap<string[][]>
}

const submitVoterCommitment = async (
  crypto: AVCrypto,
  bulletinBoard: BulletinBoard,
  sessionAddress: string,
  commitment: string,
  voterSigningKey: string,
  pilesPerContest: ContestMap<number>,
  dbbPublicKey: string): Promise<SubmitVoterCommitmentResponse> => {

  const voterCommitmentItem = {
    parentAddress: sessionAddress,
    type: VOTER_COMMITMENT_ITEM,
    content: {
      pilesPerContest: pilesPerContest,
      commitment: commitment
    }
  };

  const signedCommitmentItem = signPayload(crypto, voterCommitmentItem, voterSigningKey);
  const response = await bulletinBoard.submitCommitment(signedCommitmentItem);

  const voterCommitmentCopy: VoterCommitmentItem = response.data.voterCommitment;
  const boardCommitment = response.data.boardCommitment;
  const serverEnvelopes = response.data.envelopes;
  const receipt = response.data.receipt;

  validatePayload(crypto, voterCommitmentCopy, voterCommitmentItem);

  const boardCommitmentItemExpectation = {
    parentAddress: voterCommitmentCopy.address,
    type: BOARD_COMMITMENT_ITEM,
  }

  validatePayload(crypto, boardCommitment, boardCommitmentItemExpectation, dbbPublicKey)
  validateReceipt(crypto, [voterCommitmentCopy, boardCommitment], receipt, dbbPublicKey);

  return {
    voterCommitment: voterCommitmentCopy,
    boardCommitment,
    serverEnvelopes
  }
}

export default submitVoterCommitment;
