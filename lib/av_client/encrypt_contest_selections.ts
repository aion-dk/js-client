import { NewContestConfigMap, ContestEnvelope, NewContestConfig, ContestSelection } from "./types";
import { randomBN, ElGamalPointCryptogram } from "./aion_crypto";
import { bignumToHex, pointFromHex } from "./crypto/util";
import { bytesToPoints } from "./encoding/point_encoding";
import { contestSelectionToByteArray } from "./encoding/byte_encoding";

export function encryptContestSelections(
  contestConfigs: NewContestConfigMap,
  contestSelections: ContestSelection[],
  encryptionKey: string
): ContestEnvelope[] {
  return contestSelections.map(contestSelection => {
    const contestConfig = contestConfigs[contestSelection.reference]
    return encryptContestSelection(contestConfig, contestSelection, encryptionKey)
  })
}

function encryptContestSelection(
  contestConfig: NewContestConfig, 
  contestSelection: ContestSelection, 
  encryptionKey: string
): ContestEnvelope {
  const encodedContestSelection = contestSelectionToByteArray(contestConfig, contestSelection)
  const contestPoints = bytesToPoints(encodedContestSelection)

  // Encrypt the contestPoints
  const encryptionKeyPoint = pointFromHex(encryptionKey).toEccPoint();

  const contestEnvelope: ContestEnvelope = {
    reference: contestSelection.reference,
    cryptograms: [],
    randomizers: []
  }

  contestPoints.map(votePoint => {
    const randomizerBN = randomBN();
    const cryptogram = ElGamalPointCryptogram.encrypt(votePoint, encryptionKeyPoint, randomizerBN);

    contestEnvelope.randomizers.push(bignumToHex(randomizerBN))
    contestEnvelope.cryptograms.push(cryptogram.toString())
  })

  return contestEnvelope
}
