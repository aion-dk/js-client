const Crypto = require('./aion_crypto.js')()

export default class EncryptVotes {
  encrypt(contests: ContestIndexed<EncryptionData>, encryptionKey: PublicKey) {
    const response: ContestIndexed<EncryptionResponse> = {}
    for (let contestId in contests) {
      const { cryptogram, randomness } = Crypto.encryptVote(
        contests[contestId].voteEncodingType,
        contests[contestId].vote,
        contests[contestId].emptyCryptogram,
        encryptionKey
      );
      const proof = Crypto.generateDiscreteLogarithmProof(randomness)

      response[contestId] = {
        cryptogram: cryptogram,
        randomness: randomness,
        proof: proof
      }
    }

    return response;
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
