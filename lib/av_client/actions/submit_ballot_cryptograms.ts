import { BulletinBoard } from '../connectors/bulletin_board'
import { BallotCryptogramItem, ContestEnvelope, ContestMap, VerificationStartItem } from '../types'
import { signPayload, validatePayload, validateReceipt } from '../sign'
import { BALLOT_CRYPTOGRAMS_ITEM } from '../constants'
import { finalizeCryptograms, generateEnvelopeProofs } from '../new_crypto/finalize_cryptograms'

export async function submitBallotCryptograms(
  bulletinBoard: BulletinBoard,
  clientEnvelopes: ContestEnvelope[],
  serverEnvelopes: ContestMap<string[][]>,
  boardCommitmentAddress: string,
  voterPrivateKey: string,
  dbbPublicKey: string
): Promise<[BallotCryptogramItem, VerificationStartItem]> {

  const finalizedCryptograms = finalizeCryptograms(clientEnvelopes, serverEnvelopes)

  const ballotCryptogramsItem = {
    parentAddress: boardCommitmentAddress,
    type: BALLOT_CRYPTOGRAMS_ITEM,
    content: {
      contests: finalizedCryptograms,
    }
  }

  const signedBallotCryptogramsItem = signPayload(ballotCryptogramsItem, voterPrivateKey)

  const itemWithProofs = {
    ...signedBallotCryptogramsItem,
    proofs: generateEnvelopeProofs(clientEnvelopes)
  }

  const response = (await bulletinBoard.submitVotes(itemWithProofs));
  const ballotCryptogramsItemCopy = response.data.vote;
  const verificationItem = response.data.verification;
  const receipt = response.data.receipt;

  validatePayload(ballotCryptogramsItemCopy, ballotCryptogramsItem)
  validateReceipt([ballotCryptogramsItemCopy, verificationItem], receipt, dbbPublicKey)

  return [
    ballotCryptogramsItemCopy as BallotCryptogramItem,
    verificationItem as VerificationStartItem
  ]
}
