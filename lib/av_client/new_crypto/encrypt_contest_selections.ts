import {
  ContestConfigMap,
  ContestEnvelope,
  ContestConfig,
  ContestSelection,
  EncryptedPile, SelectionPile
} from "../types";
import { selectionPileToByteArray } from "../encoding/byte_encoding";
import {AVCrypto} from "../../av_crypto";
import { bytesToPoints } from "../encoding/point_encoding";

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
  const pilePoints = bytesToPoints(encodedSelectionPile)

  console.log("AV_CRYPTO_ENCRYPT_VOTE_CALLED!")

  const encryptedPile: EncryptedPile = {multiplier: selectionPile.multiplier, cryptograms: [], randomizers: []}
  pilePoints.map(votePoint => {
    // TODO: include `transparent` flag into `encryptVote` function; defaults to `false`
    // const randomizerBN = transparent ? new bn(0) : randomBN();
    const { cryptograms, randomizers } = crypto.encryptVote(encodedSelectionPile, encryptionKey)

    encryptedPile.cryptograms.push(cryptograms[0])
    encryptedPile.randomizers.push(randomizers[0])
  })

  return encryptedPile
}
