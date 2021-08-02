const Crypto = require('./aion_crypto.js')()

export default class EncryptVotes {
  encrypt(contestSelections, emptyCryptograms, contestEncodingTypes, encryptionKey: PublicKey) {
    const response: ContestIndexed<EncryptionResponse> = {}

    Object.keys(contestSelections).forEach(function(contestId) {
      const { cryptogram, randomness } = Crypto.encryptVote(
        contestEncodingTypes[contestId],
        contestSelections[contestId],
        emptyCryptograms[contestId],
        encryptionKey
      );
      const proof = Crypto.generateDiscreteLogarithmProof(randomness)

      response[contestId] = { cryptogram, randomness, proof }
    })

    return response;
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
type EncryptionResponse = {
  cryptogram: Cryptogram;
  randomness: BigNum;
  proof: Proof;
}
type EncryptionData = {
  vote: string;
  voteEncodingType: Number;
  emptyCryptogram: Cryptogram;
}
