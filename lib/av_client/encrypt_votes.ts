const Crypto = require('./aion_crypto.js')()
import { OpenableEnvelope } from "./types";

export default class EncryptVotes {
  encrypt(contestSelections, emptyCryptograms, contestEncodingTypes, encryptionKey: PublicKey) {
    const response: ContestIndexed<OpenableEnvelope> = {}

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

  generateTestCode(): BigNum {
    return Crypto.generateRandomNumber()
  }

  fingerprint(cryptograms: ContestIndexed<Cryptogram>) {
    const string = JSON.stringify(cryptograms)

    return Crypto.hashString(string)
  }
}

type PublicKey = string;
type Cryptogram = string;
type Proof = string;
type BigNum = string;
interface ContestIndexed<Type> {
  [index: string]: Type;
}

type EncryptionData = {
  vote: string;
  voteEncodingType: number;
  emptyCryptogram: Cryptogram;
}
