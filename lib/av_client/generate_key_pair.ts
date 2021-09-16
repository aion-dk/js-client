import * as crypto from './aion_crypto'
const Crypto = crypto();

export function randomKeyPair() {
  const keyPair = Crypto.generateKeyPair();

  return <KeyPair>{
    privateKey: keyPair.private_key,
    publicKey: keyPair.public_key
  }
}

type KeyPair = {
  privateKey: string;
  publicKey: string;
}
