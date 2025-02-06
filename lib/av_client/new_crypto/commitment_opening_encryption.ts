import {
  CommitmentOpening,
  EncryptedCommitmentOpening
} from "../types";
import {AVCrypto} from "../../av_crypto";

export function encryptCommitmentOpening(crypto: AVCrypto, verifierPublicKey: string, commitmentOpening: CommitmentOpening): EncryptedCommitmentOpening {
  const text = JSON.stringify(commitmentOpening)

  return crypto.encryptText(text, verifierPublicKey)
}

export function decryptCommitmentOpening(crypto: AVCrypto, verifierPrivateKey: string, encryptedCommitmentOpening: EncryptedCommitmentOpening ): CommitmentOpening {
  const text = crypto.decryptText(encryptedCommitmentOpening, verifierPrivateKey)

  return JSON.parse(text)
}
