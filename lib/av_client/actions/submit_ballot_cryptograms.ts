import { BulletinBoard } from '../connectors/bulletin_board'
import { BallotCryptogramItem, ContestEnvelope, ContestMap, VerificationStartItem } from '../types'
import { signPayload, validatePayload, validateReceipt } from '../sign'
import { BALLOT_CRYPTOGRAMS_ITEM } from '../constants'
import { generateDiscreteLogarithmProof } from '../aion_crypto'
import { finalizeCryptograms } from '../finalize_cryptograms'

export async function submitBallotCryptograms(
  bulletinBoard: BulletinBoard,
  clientEnvelopes: ContestEnvelope[],
  serverCryptograms: ContestMap<string[]>,
  boardCommitmentAddress: string,
  voterPrivateKey: string,
  dbbPublicKey: string
): Promise<[BallotCryptogramItem, VerificationStartItem]> {

  const finalizedCryptograms = finalizeCryptograms(clientEnvelopes, serverCryptograms)

  const ballotCryptogramsItem = {
    parentAddress: boardCommitmentAddress,
    type: BALLOT_CRYPTOGRAMS_ITEM,
    content: {
      cryptograms: finalizedCryptograms,
    }
  }

  const signedBallotCryptogramsItem = signPayload(ballotCryptogramsItem, voterPrivateKey)

  const itemWithProofs = {
    ...signedBallotCryptogramsItem,
    proofs: sealContestEnvelopes(clientEnvelopes)
  }

  const response = (await bulletinBoard.submitVotes(itemWithProofs));
  const ballotCryptogramsItemCopy = response.data.vote;
  const verificationItem = response.data.verification;
  const receipt = response.data.receipt;

  validatePayload(ballotCryptogramsItemCopy, ballotCryptogramsItem)
  // console.log('??????!!!!')
  validateReceipt([ballotCryptogramsItemCopy, verificationItem], receipt, dbbPublicKey)

  return [
    ballotCryptogramsItemCopy as BallotCryptogramItem,
    verificationItem as VerificationStartItem
  ]
}

function sealContestEnvelopes( contestEnvelopes: ContestEnvelope[] ): ContestMap<string[]> {
  const entries = contestEnvelopes.map(ce =>
    [ ce.reference, ce.randomizers.map(r => generateDiscreteLogarithmProof(r)) ]
  )
  return Object.fromEntries(entries)
}
