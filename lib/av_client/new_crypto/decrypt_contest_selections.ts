import {ContestConfigMap, ContestSelection, ContestMap, CommitmentOpening, SealedPile} from "../types"
import { byteArrayToSelectionPile } from "../encoding/byte_encoding"
import {AVCrypto} from "../../av_crypto";

export function decryptContestSelections(
  contestConfigs: ContestConfigMap,
  encryptionKey: string,
  contests: ContestMap<SealedPile[]>,
  boardCommitmentOpening: CommitmentOpening,
  voterCommitmentOpening: CommitmentOpening
): ContestSelection[] {

  const contestSelections = Object.entries(contests).map(function([contestReference, piles]): ContestSelection {
    const crypto = new AVCrypto("secp256k1")
    const contestConfig = contestConfigs[contestReference]
    const maxSize = contestConfig.content.markingType.encoding.maxSize

    const otherPiles = piles.map((sealedPile, index) => {
      const pileCryptograms = sealedPile.cryptograms
      const pileMultiplier = sealedPile.multiplier
      const boardRandomizers = boardCommitmentOpening.randomizers[contestReference][index]
      const voterRandomizers = voterCommitmentOpening.randomizers[contestReference][index]

      const bytes = crypto.revertEncryption(pileCryptograms, boardRandomizers, voterRandomizers, encryptionKey)
      const encodedContestSelection = bytes.slice(0, maxSize)

      console.log("AV_CRYPTO_REVERT_ENCRYPTION_CALLED!")

      return byteArrayToSelectionPile(contestConfig, encodedContestSelection, pileMultiplier)
    });
    return {
      reference: contestReference,
      piles: otherPiles
    }
  })

  return contestSelections;
}
