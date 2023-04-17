import {ContestConfigMap, ContestSelection, ContestMap, CommitmentOpening, SealedPile} from "./types"
import { ElGamalPointCryptogram, addBigNums } from "./aion_crypto"
import { bignumFromHex, pointFromHex } from "./crypto/util"
import { pointsToBytes } from "./encoding/point_encoding"
import { byteArrayToSelectionPile } from "./encoding/byte_encoding"

export function decryptContestSelections(
  contestConfigs: ContestConfigMap,
  encryptionKey: string,
  contests: ContestMap<SealedPile[]>,
  boardCommitmentOpening: CommitmentOpening,
  voterCommitmentOpening: CommitmentOpening
): ContestSelection[] {

  const contestSelections = Object.entries(contests).map(function([contestReference, piles]): ContestSelection {
    const contestConfig = contestConfigs[contestReference]
    const otherPiles = piles.map((sealedPile, index) => {
      const pileCryptograms = sealedPile.cryptograms
      const pileMultiplier = sealedPile.multiplier
      const randomizers = combineRandomizers(contestReference, index, boardCommitmentOpening, voterCommitmentOpening)

      const points = decryptPoints(pileCryptograms, randomizers, encryptionKey)
      const maxSize = contestConfig.content.markingType.encoding.maxSize
      const encodedContestSelection = pointsToBytes(points, maxSize)
      return byteArrayToSelectionPile(contestConfig, encodedContestSelection, pileMultiplier)
    });
    return {
      reference: contestReference,
      piles: otherPiles
    }
  })

  return contestSelections;
}

function combineRandomizers(
  contestReference: string,
  index: number,
  boardCommitmentOpening: CommitmentOpening,
  voterCommitmentOpening: CommitmentOpening
): string[] {
  const br = boardCommitmentOpening.randomizers[contestReference][index]
  const vr = voterCommitmentOpening.randomizers[contestReference][index]

  return Object.keys(vr).map(i => addBigNums(vr[i], br[i]))
}

function decryptPoints( cryptograms: string[], randomizers: string[], encryptionKey: string ){
  return cryptograms.map((cryptogram, index) => {
    const randomizer = randomizers[index]
    return decryptPoint(cryptogram, randomizer, encryptionKey)
  })
}

function decryptPoint( cryptogram: string, randomizer: string, encryptionKey: string ){
  const elGamalCryptogram = ElGamalPointCryptogram.fromString(cryptogram)
  const publicKey = pointFromHex(encryptionKey).toEccPoint()
  const randomizerBn = bignumFromHex(randomizer).toBn()

  // invert cryptogram so you can decrypt using the randomness
  const newCryptogram = new ElGamalPointCryptogram(publicKey, elGamalCryptogram.ciphertext_point)
  return newCryptogram.decrypt(randomizerBn)
}
