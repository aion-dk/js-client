import { CastVoteRecord, ContestMap, MarkingType, OpenableEnvelope } from "./types";
import { encryptVote } from './crypto/encrypt_vote';
import { hashString } from './aion_crypto';

const encrypt = (
  contestSelections: CastVoteRecord,
  markingType: MarkingType,
  encryptionKey: string): ContestMap<OpenableEnvelope> => {

  const response = {};

  Object.keys(contestSelections).forEach(function(contestId) {
    const { cryptogram, randomness } = encryptVote(
      markingType,
      contestSelections[contestId],
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

export default {
  encrypt,
  fingerprint
}

type Cryptogram = string;
