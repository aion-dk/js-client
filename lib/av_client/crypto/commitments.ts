import { EncryptedCommitmentOpening, CommitmentOpening } from '../types';
import { dhEncrypt, dhDecrypt, Payload } from './aes'
import { isValidPedersenCommitment } from './pedersen_commitment';

export function decryptCommitmentOpening( verifierPrivateKey: string, encryptedCommitmentOpening: EncryptedCommitmentOpening ): CommitmentOpening {
  const payload = Payload.fromString(encryptedCommitmentOpening)
  const message = dhDecrypt(verifierPrivateKey, payload)
  return JSON.parse(message)
}

export function encryptCommitmentOpening( verifierPublicKey: string, commitmentOpening: CommitmentOpening): EncryptedCommitmentOpening {
  const message = JSON.stringify(commitmentOpening)
  const payload = dhEncrypt(verifierPublicKey, message)
  return payload.toString()
}

export function validateCommmitmentOpening(commitmentOpening: CommitmentOpening, commitment: string, customErrorMessage?: string ): void {
  if( !isValidPedersenCommitment(commitment, commitmentOpening.randomizers, commitmentOpening.commitmentRandomness) ){
    throw new Error(customErrorMessage || 'Pedersen commitment not valid')
  }
}