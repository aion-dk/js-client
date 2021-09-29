import { ContestMap, OpenableEnvelope } from "./types";
import * as crypto from './aion_crypto'
const Crypto = crypto();

const encrypt = (contestSelections, emptyCryptograms, contestEncodingTypes, encryptionKey: PublicKey): ContestMap<OpenableEnvelope> => {
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

const generateTestCode = (): BigNum => {
  return Crypto.generateRandomNumber()
}

const fingerprint = (cryptograms: ContestMap<Cryptogram>) => {
  const string = JSON.stringify(cryptograms)

  return Crypto.hashString(string)
}

export default {
  encrypt,
  generateTestCode,
  fingerprint
}

type PublicKey = string;
type Cryptogram = string;
type BigNum = string;
