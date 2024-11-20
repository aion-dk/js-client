import { KeyPair } from '../types';
import { AVCrypto } from "../../av_crypto";

export function randomKeyPair(): KeyPair {
  const crypto = new AVCrypto("secp256k1")
  const keyPair = crypto.generateKeyPair()

  return {
    privateKey: keyPair.privateKey,
    publicKey: keyPair.publicKey
  }
}
