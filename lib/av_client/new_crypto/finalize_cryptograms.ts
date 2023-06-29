import {ContestEnvelope, ContestMap, SealedPile} from '../types';
import {AVCrypto} from "../../av_crypto";

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
