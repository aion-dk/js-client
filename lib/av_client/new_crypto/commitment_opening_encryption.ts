import {
  CommitmentOpening,
  EncryptedCommitmentOpening
} from "../types";
import {AVCrypto} from "../../av_crypto";

export function encryptCommitmentOpening(verifierPublicKey: string, commitmentOpening: CommitmentOpening): EncryptedCommitmentOpening {
  const crypto = new AVCrypto("secp256k1")
  const text = JSON.stringify(commitmentOpening)

  return crypto.encryptText(text, verifierPublicKey)
}

export function decryptCommitmentOpening(verifierPrivateKey: string, encryptedCommitmentOpening: EncryptedCommitmentOpening ): CommitmentOpening {
  const crypto = new AVCrypto("secp256k1")
  const text = crypto.decryptText(encryptedCommitmentOpening, verifierPrivateKey)

  return JSON.parse(text)
}
