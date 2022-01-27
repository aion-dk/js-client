import { KeyPair } from './types';
import { generateKeyPair  } from './aion_crypto';

export function randomKeyPair(): KeyPair {
  const keyPair = generateKeyPair();

  return {
    privateKey: keyPair.private_key,
    publicKey: keyPair.public_key
  }
}
