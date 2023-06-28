import { EncryptedCommitmentOpening, CommitmentOpening } from '../types';
import { dhEncrypt, dhDecrypt, DHPackage } from './aes'

export function decryptCommitmentOpening( verifierPrivateKey: string, encryptedCommitmentOpening: EncryptedCommitmentOpening ): CommitmentOpening {
  const dhPackage = DHPackage.fromString(encryptedCommitmentOpening)
  const message = dhDecrypt(verifierPrivateKey, dhPackage)
  return JSON.parse(message)
}

export function encryptCommitmentOpening( verifierPublicKey: string, commitmentOpening: CommitmentOpening): EncryptedCommitmentOpening {
  const message = JSON.stringify(commitmentOpening)
  const dhPackage = dhEncrypt(verifierPublicKey, message)
  return dhPackage.toString()
}
