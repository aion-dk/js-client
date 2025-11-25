import {
  ContestConfigMap,
  ContestEnvelope,
  ContestConfig,
  ContestSelection,
  EncryptedPile, SelectionPile
} from "../types";
import { selectionPileToByteArray } from "../encoding/byte_encoding";
import { AVCrypto } from "@assemblyvoting/av-crypto";

export function encryptContestSelections(
  crypto: AVCrypto,
  contestConfigs: ContestConfigMap,
  contestSelections: ContestSelection[],
  encryptionKey: string,
  transparent: boolean
): ContestEnvelope[] {
  return contestSelections.map(contestSelection => {
    const contestConfig = contestConfigs[contestSelection.reference]
    return encryptContestSelection(crypto, contestConfig, contestSelection, encryptionKey, transparent)
  })
}

function encryptContestSelection(
  crypto: AVCrypto,
  contestConfig: ContestConfig,
  contestSelection: ContestSelection,
  encryptionKey: string,
  transparent: boolean
): ContestEnvelope {
  if( contestConfig.content.reference !== contestSelection.reference ){
    throw new Error("contest selection does not match contest")
  }

  const encryptedPiles: EncryptedPile[] = contestSelection.piles.map(sp => {
    return encryptSelectionPile(crypto, contestConfig, sp, encryptionKey, transparent)
  })

  return {
    reference: contestSelection.reference,
    piles: encryptedPiles,
  }
}

function encryptSelectionPile(
  crypto: AVCrypto,
  contestConfig: ContestConfig,
  selectionPile: SelectionPile,
  encryptionKey: string,
  transparent: boolean
): EncryptedPile {
  const encodedSelectionPile = selectionPileToByteArray(contestConfig, selectionPile)
  const encryptedSelectionPile  = transparent ?
    crypto.encryptTransparentVote(encodedSelectionPile, encryptionKey) :
    crypto.encryptVote(encodedSelectionPile, encryptionKey);

  return {
    multiplier: selectionPile.multiplier,
    cryptograms: encryptedSelectionPile.cryptograms,
    randomizers: encryptedSelectionPile.randomizers
  }
}
