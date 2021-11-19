import { CastVoteRecord, ContestMap, OpenableEnvelope } from "./types";
import * as crypto from './aion_crypto'
const Crypto = crypto();

const encrypt = (
  contestSelections: CastVoteRecord,
  emptyCryptograms: ContestMap<string>,
  contestEncodingTypes: ContestMap<number>,
  encryptionKey: string): ContestMap<OpenableEnvelope> => {

  const response = {}

  Object.keys(contestSelections).forEach(function(contestId) {
    const { cryptogram, randomness } = Crypto.encryptVote(
      contestEncodingTypes[contestId],
      contestSelections[contestId],
      emptyCryptograms[contestId],
      encryptionKey
    );

    response[contestId] = { cryptogram, randomness }
  })

  return response;
}

const fingerprint = (cryptograms: ContestMap<Cryptogram>): string => {
  const string = JSON.stringify(cryptograms)

  return Crypto.hashString(string)
}

export default {
  encrypt,
  fingerprint
}

type Cryptogram = string;
