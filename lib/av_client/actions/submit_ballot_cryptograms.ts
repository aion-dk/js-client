import { BulletinBoard } from '../connectors/bulletin_board'
import { BallotCryptogramItem, ContestEnvelope, ContestMap, VerificationStartItem } from '../types'
import { signPayload, validatePayload, validateReceipt } from '../sign'
import { BALLOT_CRYPTOGRAMS_ITEM } from '../constants'
import { generateDiscreteLogarithmProof } from '../aion_crypto'
import { finalizeCryptograms } from '../finalize_cryptograms'

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
  // const receipt = response.data.receipt;

  // validatePayload(ballotCryptogramsItemCopy, ballotCryptogramsItem)
  // validateReceipt([ballotCryptogramsItemCopy, verificationItem], receipt, dbbPublicKey)

  return [
    ballotCryptogramsItemCopy as BallotCryptogramItem,
    verificationItem as VerificationStartItem
  ]
}

function generateEnvelopeProofs( contestEnvelopes: ContestEnvelope[] ): ContestMap<string[][]> {
  const entries = contestEnvelopes.map(ce => {
    const envelopeProofs = ce.piles.map((p) => {
      return p.randomizers.map(r => generateDiscreteLogarithmProof(r))
    })
    return [ce.reference, envelopeProofs]
  }
  )
  return Object.fromEntries(entries)
}
