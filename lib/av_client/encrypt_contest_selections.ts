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
import { selectionPileToByteArray } from "./encoding/byte_encoding";
import {SjclEllipticalPoint, bn} from "./sjcl";

export function encryptContestSelections(
  contestConfigs: ContestConfigMap,
  contestSelections: ContestSelection[],
  encryptionKey: string,
  transparent: boolean
): ContestEnvelope[] {
  return contestSelections.map(contestSelection => {
    const contestConfig = contestConfigs[contestSelection.reference]
    return encryptContestSelection(contestConfig, contestSelection, encryptionKey, transparent)
  })
}

function encryptContestSelection(
  contestConfig: ContestConfig,
  contestSelection: ContestSelection,
  encryptionKey: string,
  transparent: boolean
): ContestEnvelope {
  if( contestConfig.content.reference !== contestSelection.reference ){
    throw new Error("contest selection does not match contest")
  }

  const encryptionKeyPoint = pointFromHex(encryptionKey).toEccPoint();

  const encryptedPiles: EncryptedPile[] = contestSelection.piles.map(sp => {
    return encryptSelectionPile(contestConfig, sp, encryptionKeyPoint, transparent)
  })

  return {
    reference: contestSelection.reference,
    piles: encryptedPiles,
  }
}

function encryptSelectionPile(
  contestConfig: ContestConfig,
  selectionPile: SelectionPile,
  encryptionKeyPoint: SjclEllipticalPoint,
  transparent: boolean
): EncryptedPile {
  const encodedSelectionPile = selectionPileToByteArray(contestConfig, selectionPile)
  const pilePoints = bytesToPoints(encodedSelectionPile)

  const encryptedPile: EncryptedPile = {multiplier: selectionPile.multiplier, cryptograms: [], randomizers: []}

  pilePoints.map(votePoint => {
    const randomizerBN = transparent ? new bn(0) : randomBN();
    const cryptogram = ElGamalPointCryptogram.encrypt(votePoint, encryptionKeyPoint, randomizerBN);

    encryptedPile.randomizers.push(bignumToHex(randomizerBN))
    encryptedPile.cryptograms.push(cryptogram.toString())
  })

  return encryptedPile
}
