import { ContestMap } from "./types";

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

  async getServerCommitmentOpening(voterCommitmentOpening: ContestMap<BigNum []>, encryptedBallotCryptograms: ContestMap<Cryptogram>) {
    const { data } = await this.bulletinBoard.getCommitmentOpening(voterCommitmentOpening, encryptedBallotCryptograms)

    if (data.error) {
      throw new Error(data.error.description)
    }

    return data.commitment_opening
  }

  verifyCommitmentOpening(serverCommitmentOpening: ContestMap<BigNum []>, serverCommitment: PublicKey, serverEmptyCryptograms: ContestMap<Cryptogram>) {
    // TODO: implement me
    return true;
  }
}

interface Connector {
  getRandomizers: () => Promise<any>,
  getCommitmentOpening: (voterCommitmentOpening: ContestMap<BigNum []>, encryptedBallotCryptograms: ContestMap<Cryptogram>) => Promise<any>
}

type PublicKey = string;
type Cryptogram = string;
type BigNum = string;
