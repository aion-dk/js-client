import * as sjcl from "sjcl-with-all";
import {BitArray} from "../sjcl";

export const KEY_BYTE_SIZE = 32
export const TAG_BYTE_SIZE = 16
export const IV_BYTE_SIZE = 12

export function encrypt(symmetricKey: BitArray, message: string, iv: BitArray = randomIV() ): [BitArray, BitArray, BitArray]{
  const prf = new sjcl.cipher.aes(symmetricKey);
  const plaintext = sjcl.codec.utf8String.toBits(message)
  const adata = []
  const tagBitSize = TAG_BYTE_SIZE * 8

  const ciphertextAndTag = sjcl.mode.gcm.encrypt(
    prf,
    plaintext,
    iv,
    adata,
    tagBitSize
  );

  // separate ciphertext from tag
  const bitSize = sjcl.bitArray.bitLength(ciphertextAndTag);
  const ciphertext = sjcl.bitArray.clamp(ciphertextAndTag, bitSize - tagBitSize)
  const tag = sjcl.bitArray.bitSlice(ciphertextAndTag, bitSize - tagBitSize)

  return [ciphertext, tag, iv]
}

export function decrypt(symmetricKey, ciphertext, tag, iv){
  const prf = new sjcl.cipher.aes(symmetricKey);
  const ciphertextAndTag = sjcl.bitArray.concat(ciphertext, tag)
  const adata = []

  const plaintext = sjcl.mode.gcm.decrypt(
    prf,
    ciphertextAndTag,
    iv,
    adata,
    TAG_BYTE_SIZE * 8
  );

  return sjcl.codec.utf8String.fromBits(plaintext)
}

function randomIV(): BitArray {
  return sjcl.random.randomWords(IV_BYTE_SIZE / 4)
}
