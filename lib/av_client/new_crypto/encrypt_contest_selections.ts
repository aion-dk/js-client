import {
  ContestConfigMap,
  ContestEnvelope,
  ContestConfig,
  ContestSelection,
  EncryptedPile, SelectionPile
} from "../types";
import { selectionPileToByteArray } from "../encoding/byte_encoding";
import { AVCrypto } from "../../av_crypto";

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

  const encryptedPiles: EncryptedPile[] = contestSelection.piles.map(sp => {
    return encryptSelectionPile(contestConfig, sp, encryptionKey, transparent)
  })

  return {
    reference: contestSelection.reference,
    piles: encryptedPiles,
  }
}

function encryptSelectionPile(
  contestConfig: ContestConfig,
  selectionPile: SelectionPile,
  encryptionKey: string,
  transparent: boolean
): EncryptedPile {
  const crypto = new AVCrypto("secp256k1")

  const encodedSelectionPile = selectionPileToByteArray(contestConfig, selectionPile)
  const encryptedSelectionPile  = transparent ?
    crypto.encryptTransparentVote(encodedSelectionPile, encryptionKey) :
    crypto.encryptVote(encodedSelectionPile, encryptionKey);

  console.log("AV_CRYPTO_ENCRYPT_VOTE_CALLED!")
  console.log("TRANSPARENT " + transparent)

  return {
    multiplier: selectionPile.multiplier,
    cryptograms: encryptedSelectionPile.cryptograms,
    randomizers: encryptedSelectionPile.randomizers
  }
}
