import {
  bignumToHex,
  pointFromHex,
} from "./util";

import { voteToPoint } from "./vote_converter";

import * as crypto from "../aion_crypto";
import { MarkingType } from "../types";

export const encryptVote = (markingType: MarkingType, vote, encryption_key_string: string) => {
  const vote_point = voteToPoint(markingType, vote)
  return encryptVotePoint(vote_point, encryption_key_string)
}

function encryptVotePoint(vote_point, encryption_key_string: string) {
  const encryption_key = pointFromHex(encryption_key_string).toEccPoint();
  const randomness_bn = crypto.randomBN();
  const vote_cryptogram = crypto.ElGamalPointCryptogram.encrypt(vote_point, encryption_key, randomness_bn);

  return {
    cryptogram: vote_cryptogram.toString(),
    randomness: bignumToHex(randomness_bn)
  }
}
