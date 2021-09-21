export default class BenalohChallenge {
  bulletinBoard: any;

  constructor(bulletinBoard) {
    this.bulletinBoard = bulletinBoard;
  }

  async getServerRandomizers() {
    const { data } = await this.bulletinBoard.getRandomizers()

    if (data.error) {
      throw new Error(data.error.description)
    }

    return data.randomizers
  }

  async getServerCommitmentOpening(voterCommitmentOpening: ContestIndexed<BigNum []>, encryptedBallotCryptograms: ContestIndexed<Cryptogram>) {
    const { data } = await this.bulletinBoard.getCommitmentOpening(voterCommitmentOpening, encryptedBallotCryptograms)

    if (data.error) {
      throw new Error(data.error.description)
    }

    return data.commitment_opening
  }

  verifyCommitmentOpening(serverCommitmentOpening: ContestIndexed<BigNum []>, serverCommitment: PublicKey, serverEmptyCryptograms: ContestIndexed<Cryptogram>) {
    // TODO: implement me
    return true;
  }
}

interface Connector {
  getRandomizers: () => Promise<any>,
  getCommitmentOpening: (voterCommitmentOpening: ContestIndexed<BigNum []>, encryptedBallotCryptograms: ContestIndexed<Cryptogram>) => Promise<any>
}

interface ContestIndexed<Type> {
  [index: string]: Type;
}

type PublicKey = string;
type Cryptogram = string;
type BigNum = string;
