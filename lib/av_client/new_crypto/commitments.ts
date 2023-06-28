import {
  CommitmentOpening,
  ContestMap
} from "../types";
import {AVCrypto} from "../../av_crypto";
import {concatForHashing} from "../../av_crypto/utils";

export function generateCommitment(randomizersMap: ContestMap<string[][]>): { commitment: string, randomizer: string } {
  const crypto = new AVCrypto("secp256k1")

  const randomizers = flattenRandomizers(randomizersMap)
  const context = concatContext(randomizersMap)

  const commitment = crypto.commit(randomizers, context)

  console.log("AV_CRYPTO_COMMIT_CALLED!")

  return {
    commitment: commitment.commitment,
    randomizer: commitment.privateCommitmentRandomizer,
  }
}

export function validateCommitment(commitmentOpening: CommitmentOpening, commitment: string, customErrorMessage?: string ): void {
  const crypto = new AVCrypto("secp256k1")
  const encryptionRandomizers = flattenRandomizers(commitmentOpening.randomizers)
  const context = concatContext(commitmentOpening.randomizers)

  const valid = crypto.isValidCommitment(
    commitment,
    commitmentOpening.commitmentRandomness,
    encryptionRandomizers,
    context
  )

  console.log("AV_CRYPTO_IS_VALID_COMMITMENT_CALLED!")

  if(!valid){
    throw new Error(customErrorMessage || 'Pedersen commitment not valid')
  }
}

function flattenRandomizers(randomizersMap: ContestMap<string[][]>): string[] {
  const iterator = Object.entries(randomizersMap)

  return iterator.map(([_, matrix]) => matrix).flat(2)
}

function concatContext(randomizersMap: ContestMap<string[][]>): string {
  const iterator = Object.entries(randomizersMap)

  return concatForHashing(iterator.map(([reference, _]) => reference))
}
