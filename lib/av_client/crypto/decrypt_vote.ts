import {
  bignumToHex,
  bignumFromHex,
  pointToHex,
  pointFromHex
} from "./util";

import { pointToVote } from "./vote_converter";

import * as crypto from "../aion_crypto";
import { MarkingType } from "../types";
import Point from "./point";

export const decryptVote = (markingType: MarkingType, cryptograms: string[], randomizers: string[], encryptionKey: string): string => {

  const points = cryptograms.map((cryptogram, index) => {
    const randomizer = randomizers[index];
    return decryptVotePoint(cryptogram, randomizer, encryptionKey);
  });

  // TODO: Will fail, until TODO below is fixed
  return pointToVote(points[0]).vote;
}

function decryptVotePoint(cryptogram: string, randomizer: string, encryptionKey: string): string {
  const elGamalCryptogram = crypto.ElGamalPointCryptogram.fromString(cryptogram);
  const publicKey = pointFromHex(encryptionKey).toEccPoint();
  const randomizerBn = bignumFromHex(randomizer).toBn();

  // invert cryptogram so you can decrypt using the randomness
  const newCryptogram = new crypto.ElGamalPointCryptogram(publicKey, elGamalCryptogram.ciphertext_point)
  const decryptedPoint = new Point(newCryptogram.decrypt(randomizerBn))

  return pointToHex(decryptedPoint)
}
