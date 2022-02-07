import { CastVoteRecord, ContestMap, MarkingType, OpenableEnvelope } from "./types";
import { encryptVote } from './crypto/encrypt_vote';
import { hashString, ElGamalPointCryptogram } from './aion_crypto';

const encrypt = (
  contestSelections: CastVoteRecord,
  markingType: MarkingType,
  encryptionKey: string): ContestMap<OpenableEnvelope> => {

  const response = {};

  Object.keys(contestSelections).forEach(function(contestId) {
    const { cryptogram, randomness } = encryptVote(
      markingType,
      contestSelections[contestId].toString(),
      encryptionKey
    );

    response[contestId] = { cryptogram, randomness }
  })

  return response;
}

const fingerprint = (cryptograms: ContestMap<Cryptogram>): string => {
  const string = JSON.stringify(cryptograms)

  return hashString(string)
}

const homomorphicallyAddCryptograms = (cryptogram1: string, cryptogram2: string) => {
  const point1 = ElGamalPointCryptogram.fromString(cryptogram1);
  const point2 = ElGamalPointCryptogram.fromString(cryptogram2);
  
  point1.homomorphicallyAddCryptogram(point2);
  return point1.toString();
}

export default {
  encrypt,
  fingerprint,
  homomorphicallyAddCryptograms
}

type Cryptogram = string;
