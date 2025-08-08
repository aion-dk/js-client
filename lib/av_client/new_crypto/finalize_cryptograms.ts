import {ContestEnvelope, ContestMap, SealedPile} from '../types';
import {AVCrypto} from "@assemblyvoting/av-crypto";

export function generateEnvelopeProofs( crypto: AVCrypto, contestEnvelopes: ContestEnvelope[] ): ContestMap<string[][]> {
  const entries = contestEnvelopes.map(ce => {
      const envelopeProofs = ce.piles.map((p) => {
        return p.randomizers.map(r => crypto.generateProofOfCorrectEncryption(r))
      })
      return [ce.reference, envelopeProofs]
    }
  )
  return Object.fromEntries(entries)
}

export function finalizeCryptograms(crypto: AVCrypto, contestEnvelopes: ContestEnvelope[], serverCryptograms: ContestMap<string[][]>): ContestMap<SealedPile[]> {
  const entries = contestEnvelopes.map(ce => {
      const finalizedCryptograms = ce.piles.map((p, index) => {
        return {
          multiplier: p.multiplier,
          cryptograms: addCryptograms(crypto, p.cryptograms, serverCryptograms[ce.reference][index])
        }
      })
      return [ce.reference, finalizedCryptograms]
    }
  )
  return Object.fromEntries(entries)
}

function addCryptograms(crypto: AVCrypto, list1: string[], list2: string[]) {
  return list1.map((cryptogram, i) => {
    return crypto.combineCryptograms(cryptogram, list2[i])
  })
}
