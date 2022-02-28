import {
  bignumToHex,
  bignumFromHex,
  pointToHex,
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

function decryptVotePoint(cryptogram: string, decryptionKey: string, encryptionKey: string): string {
  const elGamalCryptogram = crypto.ElGamalPointCryptogram.fromString(cryptogram);
  const decryptionKeyBn = bignumFromHex(decryptionKey).toBn();

  // TODO: Replace elgamalcryptogram R-value with encryption key
  // and then decrypt (talk to Stefan)

  const point = elGamalCryptogram.decrypt(decryptionKeyBn);
  return pointToHex(new Point(point));
}
