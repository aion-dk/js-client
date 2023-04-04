import {
  ContestConfigMap,
  ContestEnvelope,
  ContestConfig,
  ContestSelection,
  EncryptedPile, SelectionPile
} from "./types";
import { randomBN, ElGamalPointCryptogram } from "./aion_crypto";
import { bignumToHex, pointFromHex } from "./crypto/util";
import { bytesToPoints } from "./encoding/point_encoding";
import { contestSelectionToByteArray } from "./encoding/byte_encoding";
import {SjclEllipticalPoint} from "./sjcl";

export function encryptContestSelections(
  contestConfigs: ContestConfigMap,
  contestSelections: ContestSelection[],
  encryptionKey: string
): ContestEnvelope[] {
  return contestSelections.map(contestSelection => {
    const contestConfig = contestConfigs[contestSelection.reference]
    return encryptContestSelection(contestConfig, contestSelection, encryptionKey)
  })
}

function encryptContestSelection(
  contestConfig: ContestConfig,
  contestSelection: ContestSelection,
  encryptionKey: string
): ContestEnvelope {
  if( contestConfig.content.reference !== contestSelection.reference ){
    throw new Error("contest selection does not match contest")
  }

  const encryptionKeyPoint = pointFromHex(encryptionKey).toEccPoint();

  const encryptedPiles: EncryptedPile[] = contestSelection.piles.map(sp => {
    return encryptSelectionPile(contestConfig, sp, encryptionKeyPoint)
  })

  return {
    reference: contestSelection.reference,
    piles: encryptedPiles,
  }
}

function encryptSelectionPile(
  contestConfig: ContestConfig,
  selectionPile: SelectionPile,
  encryptionKeyPoint: SjclEllipticalPoint
): EncryptedPile {
  const encodedSelectionPile = contestSelectionToByteArray(contestConfig, selectionPile)
  const pilePoints = bytesToPoints(encodedSelectionPile)

  const encryptedPile: EncryptedPile = {multiplier: selectionPile.multiplier, cryptograms: [], randomizers: []}

  pilePoints.map(votePoint => {
    const randomizerBN = randomBN();
    const cryptogram = ElGamalPointCryptogram.encrypt(votePoint, encryptionKeyPoint, randomizerBN);

    encryptedPile.randomizers.push(bignumToHex(randomizerBN))
    encryptedPile.cryptograms.push(cryptogram.toString())
  })

  return encryptedPile
}
