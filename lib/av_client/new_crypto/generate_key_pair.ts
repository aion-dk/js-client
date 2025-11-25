import { KeyPair } from '../types';
import { AVCrypto } from "@assemblyvoting/av-crypto";

export function randomKeyPair(crypto: AVCrypto): KeyPair {
  const keyPair = crypto.generateKeyPair()

  return {
    privateKey: keyPair.privateKey,
    publicKey: keyPair.publicKey
  }
}
