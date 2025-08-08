import {
  CommitmentOpening,
  ContestMap
} from "../types";
import {AVCrypto} from "@assemblyvoting/av-crypto";

export function generateCommitment(crypto: AVCrypto, randomizersMap: ContestMap<string[][]>): { commitment: string, randomizer: string } {
  const randomizers = flattenRandomizers(randomizersMap)
  const context = contestReferences(randomizersMap)
  const commitment = crypto.commit(randomizers, context)

  return {
    commitment: commitment.commitment,
    randomizer: commitment.privateCommitmentRandomizer,
  }
}
export function validateCommitment(crypto: AVCrypto, commitmentOpening: CommitmentOpening, commitment: string, customErrorMessage?: string ): void {
  const encryptionRandomizers = flattenRandomizers(commitmentOpening.randomizers)
  const context = contestReferences(commitmentOpening.randomizers)

  const valid = crypto.isValidCommitment(
    commitment,
    commitmentOpening.commitmentRandomness,
    encryptionRandomizers,
    context
  )

  if(!valid){
    throw new Error(customErrorMessage || 'Pedersen commitment not valid')
  }
}

function flattenRandomizers(randomizersMap: ContestMap<string[][]>): string[] {
  const iterator = Object.entries(randomizersMap)

  return iterator.map(([_, matrix]) => matrix).flat(2)
}

function contestReferences(randomizersMap: ContestMap<string[][]>): string[] {
  return Object.keys(randomizersMap)
}
