import {
  ContestConfigMap,
  ContestEnvelope,
  ContestConfig,
  ContestSelection,
  EncryptedPile, SelectionPile
} from "../types";
import { selectionPileToByteArray } from "../encoding/byte_encoding";
import {AVCrypto} from "../../av_crypto";

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

  const encryptedPiles: EncryptedPile[] = contestSelection.piles.map(sp => {
    return encryptSelectionPile(contestConfig, sp, encryptionKey)
  })

  return {
    reference: contestSelection.reference,
    piles: encryptedPiles,
  }
}

function encryptSelectionPile(
  contestConfig: ContestConfig,
  selectionPile: SelectionPile,
  encryptionKey: string
): EncryptedPile {
  const crypto = new AVCrypto("secp256k1")

  const encodedSelectionPile = selectionPileToByteArray(contestConfig, selectionPile)
  const {cryptograms, randomizers} = crypto.encryptVote(encodedSelectionPile, encryptionKey)

  console.log("AV_CRYPTO_ENCRYPT_VOTE_CALLED!")

  return {
    multiplier: selectionPile.multiplier,
    cryptograms: cryptograms,
    randomizers: randomizers
  }
}
