const Crypto = require('./aion_crypto.js')()

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
