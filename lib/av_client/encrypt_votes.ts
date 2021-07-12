const Crypto = require('./aion_crypto.js')()

export default class EncryptVotes {
  encrypt(contests: ContestIndexed<EncryptionData>, encryptionKey: PublicKey) {

      const cryptograms: ContestIndexed<Cryptogram> = {}
      for (let contestId in contests) {
          cryptograms[contestId] = Crypto.encryptVote(
              Crypto.VOTE_ENCODING_TYPE.TEXT_UTF8,
              contests[contestId].vote,
              contests[contestId].emptyCryptogram,
              encryptionKey
          )
      }

      return cryptograms;
  }
}

type PublicKey = string;
type Cryptogram = string;
interface ContestIndexed<Type> {
    [index: string]: Type;
}
type EncryptionData = {
    vote: string;
    emptyCryptogram: Cryptogram;
}
