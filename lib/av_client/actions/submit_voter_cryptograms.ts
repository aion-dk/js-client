import { BulletinBoard } from '../connectors/bulletin_board';
import { BallotCryptogramItem, ContestMap, OpenableEnvelope, VerificationStartItem } from '../types';
import { finalizeBallotCryptograms } from './finalize_ballot_cryptograms';
import { sealEnvelopes, signPayload, validatePayload , validateReceipt} from '../sign';
import { BALLOT_CRYPTOGRAMS_ITEM } from '../constants';

const submitVoterCryptograms = async (
  bulletinBoard: BulletinBoard,
  clientEnvelopes: ContestMap<OpenableEnvelope>,
  serverEnvelopes: ContestMap<string[]>,
  boardCommitmentAddress: string,
  voterSigningKey: string,
  dbbPublicKey: string
  ): Promise<[BallotCryptogramItem, VerificationStartItem]> => {

  const finalizedCryptograms = finalizeBallotCryptograms(clientEnvelopes, serverEnvelopes)

  const ballotCryptogramsItem = {
    parentAddress: boardCommitmentAddress,
    type: BALLOT_CRYPTOGRAMS_ITEM,
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

  const response = (await bulletinBoard.submitVotes(itemWithProofs));
  const ballotCryptogramsItemCopy = response.data.vote;
  const verificationItem = response.data.verification;
  const receipt = response.data.receipt;

  validatePayload(ballotCryptogramsItemCopy, ballotCryptogramsItem);
  validateReceipt([ballotCryptogramsItemCopy, verificationItem], receipt, dbbPublicKey);

  return [
    ballotCryptogramsItemCopy as BallotCryptogramItem,
    verificationItem as VerificationStartItem
  ];
}

export default submitVoterCryptograms;
