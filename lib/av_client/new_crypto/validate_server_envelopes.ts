
import {AVCrypto} from "@assemblyvoting/av-crypto";
import {ContestMap} from "@assemblyvoting/types";

export function validateServerEnvelopes(crypto: AVCrypto, serverEnvelopes: ContestMap<string[][]>, serverRandomizers: ContestMap<string[][]>, encryptionKey: string): void {
  const randomizers = flattenRandomizers(serverRandomizers)
  const cryptograms = flattenRandomizers(serverEnvelopes)

  if (randomizers.length !== cryptograms.length) {
    throw new Error('Server envelope contests do not match commitment opening contests');
  }

  for (let i = 0; i < cryptograms.length; i++) {
    if (!crypto.isEmptyCryptogram(cryptograms[i], randomizers[i], encryptionKey)) {
      throw new Error('Server envelope not empty');
    }
  }
}

function flattenRandomizers(map: ContestMap<string[][]>): string[] {
  const iterator = Object.entries(map)

  return iterator.map(([_, matrix]) => matrix).flat(2)
}

