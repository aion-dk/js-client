import {ContestEnvelope, ContestMap, SealedPile} from '../types';
import {AVCrypto} from "../../av_crypto";

export function generateEnvelopeProofs( contestEnvelopes: ContestEnvelope[] ): ContestMap<string[][]> {
  const crypto = new AVCrypto("secp256k1")

  const entries = contestEnvelopes.map(ce => {
      const envelopeProofs = ce.piles.map((p) => {
        const proofs = p.randomizers.map(r => crypto.generateProofOfCorrectEncryption(r))

        console.log("AV_CRYPTO_GENERATE_PROOF_OF_CORRECT_ENCRYPTION_CALLED!")

        return proofs
      })
      return [ce.reference, envelopeProofs]
    }
  )
  return Object.fromEntries(entries)
}

export function finalizeCryptograms(contestEnvelopes: ContestEnvelope[], serverCryptograms: ContestMap<string[][]>): ContestMap<SealedPile[]> {
  const entries = contestEnvelopes.map(ce => {
      const finalizedCryptograms = ce.piles.map((p, index) => {
        return {
          multiplier: p.multiplier,
          cryptograms: addCryptograms(p.cryptograms, serverCryptograms[ce.reference][index])
        }
      })
      return [ce.reference, finalizedCryptograms]
    }
  )
  return Object.fromEntries(entries)
}

function addCryptograms(list1: string[], list2: string[]) {
  const crypto = new AVCrypto("secp256k1")

  return list1.map((cryptogram, i) => {
    const finalCryptogram = crypto.combineCryptograms(cryptogram, list2[i])

    console.log("AV_CRYPTO_COMBINE_CRYPTOGRAMS_CALLED!")

    return finalCryptogram
  })
}
