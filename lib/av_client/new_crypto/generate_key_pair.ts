import { KeyPair } from '../types';
import { AVCrypto } from "../../av_crypto";

export function randomKeyPair(crypto: AVCrypto): KeyPair {
  const keyPair = crypto.generateKeyPair()

  return {
    privateKey: keyPair.privateKey,
    publicKey: keyPair.publicKey
  }
}
