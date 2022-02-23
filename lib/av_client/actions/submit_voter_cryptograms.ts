import { BulletinBoard } from '../connectors/bulletin_board';
import { BallotCryptogramItem, BoardItemType, ContestMap, OpenableEnvelope, VerificationStartItem } from '../types';
import { finalizeBallotCryptograms } from './finalize_ballot_cryptograms';
import { sealEnvelopes, signPayload, validatePayload } from '../sign';

const submitVoterCryptograms = async (
  bulletinBoard: BulletinBoard,
  clientEnvelopes: ContestMap<OpenableEnvelope>,
  serverEnvelopes: ContestMap<string[]>,
  boardCommitmentAddress: string,
  voterSigningKey: string
  ): Promise<[BallotCryptogramItem, VerificationStartItem]> => {

  const finalizedCryptograms = finalizeBallotCryptograms(clientEnvelopes, serverEnvelopes)

  const ballotCryptogramsItem = {
    parentAddress: boardCommitmentAddress,
    type: "BallotCryptogramsItem",
    content: {
      cryptograms: finalizedCryptograms,
    }
  };

  const signedBallotCryptogramsItem = signPayload(ballotCryptogramsItem, voterSigningKey);
  // TODO: clarify how the receipt should be strucuted.

  const itemWithProofs = {
    ...signedBallotCryptogramsItem,
    proofs: sealEnvelopes(clientEnvelopes)
  };
  const response = (await bulletinBoard.submitVotes(itemWithProofs)).data;
  const ballotCryptogramsItemResponse = response.vote;

  const ballotCryptogramsItemExpectation = {
    parentAddress: boardCommitmentAddress,
    type: "BallotCryptogramsItem" as BoardItemType,
    content: {
      cryptograms: finalizedCryptograms,
    }
  }

  validatePayload(ballotCryptogramsItemResponse, ballotCryptogramsItemExpectation)

  return [
    ballotCryptogramsItemResponse as BallotCryptogramItem,
    response.verification as VerificationStartItem
  ];
}

export default submitVoterCryptograms;
