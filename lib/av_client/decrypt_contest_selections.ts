import { NewContestConfigMap, ContestSelection, ContestMap, CommitmentOpening } from "./types"
// import { ContestConfigMap, ContestSelection, ContestMap, CommitmentOpening } from "./types"
import { ElGamalPointCryptogram, addBigNums } from "./aion_crypto"
import { bignumFromHex, pointFromHex } from "./crypto/util"
import { pointsToBytes } from "./encoding/point_encoding"
import { byteArrayToContestSelection } from "./encoding/byte_encoding"

export function decryptContestSelections(
  contestConfigs: NewContestConfigMap,
  encryptionKey: string,
  cryptograms: ContestMap<string[]>,
  boardCommitmentOpening: CommitmentOpening,
  voterCommitmentOpening: CommitmentOpening
): ContestSelection[] {

  return Object.keys(cryptograms).map(function(contestReference) {
    const contestConfig = contestConfigs[contestReference]
    const contestCryptograms = cryptograms[contestReference]
    const randomizers = combineRandomizers(contestReference, boardCommitmentOpening, voterCommitmentOpening)

    const points = decryptPoints(contestCryptograms, randomizers, encryptionKey)
    const maxSize = contestConfig.content.markingType.encoding.maxSize
    const encodedContestSelection = pointsToBytes(points, maxSize)
    return byteArrayToContestSelection(contestConfig, encodedContestSelection)
  })
}

function combineRandomizers( 
  contestReference: string, 
  boardCommitmentOpening: CommitmentOpening, 
  voterCommitmentOpening: CommitmentOpening 
){
  const br = boardCommitmentOpening.randomizers[contestReference]
  const vr = voterCommitmentOpening.randomizers[contestReference]

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
