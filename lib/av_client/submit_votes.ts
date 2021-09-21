import { ContestIndexed as ContestMap, OpenableEnvelope } from './types'
import { AcknowledgedBoardHash, signVotes, sealEnvelopes, assertValidReceipt } from './sign'

type Affidavit = string

type SignAndSubmitArguments = {
  voterIdentifier: string;
  electionId: number;
  encryptedVotes: ContestMap<OpenableEnvelope>;
  voterPrivateKey: string;
  electionSigningPublicKey: string,
  affidavit: Affidavit
}

interface BallotBoxReceipt {
  previousBoardHash: HashValue
  boardHash: HashValue
  registeredAt: string
  serverSignature: Signature
  voteSubmissionId: any
}

export default class SubmitVotes {
  bulletinBoard: BulletinBoard;

  constructor(bulletinBoard: BulletinBoard) {
    this.bulletinBoard = bulletinBoard;
  }

  async signAndSubmitVotes(args: SignAndSubmitArguments): Promise<BallotBoxReceipt> {
    const { voterIdentifier, electionId, encryptedVotes, voterPrivateKey, electionSigningPublicKey } = args

    const acknowledgeResponse = await this.acknowledge()

    const { contentHash, voterSignature } = signVotes(encryptedVotes, acknowledgeResponse, electionId, voterIdentifier, voterPrivateKey);
    const cryptogramsWithProofs = sealEnvelopes(encryptedVotes)

    const ballotBoxReceipt = await this.submit({ contentHash, voterSignature, cryptogramsWithProofs })
    //console.log(ballotBoxReceipt, voterSignature)
    assertValidReceipt({ contentHash, voterSignature, receipt: ballotBoxReceipt, electionSigningPublicKey });

    return ballotBoxReceipt
  }

  private async submit({ contentHash, voterSignature, cryptogramsWithProofs }) {
    const { data } = await this.bulletinBoard.submitVotes(contentHash, voterSignature, cryptogramsWithProofs)

    if (data.error) {
      throw new Error(data.error.description)
    }

    const receipt = {
      previousBoardHash: data.previousBoardHash,
      boardHash: data.boardHash,
      registeredAt: data.registeredAt,
      serverSignature: data.serverSignature,
      voteSubmissionId: data.voteSubmissionId
    }

    return receipt
  }

  private async acknowledge(): Promise<AcknowledgedBoardHash> {
    const { data } = await this.bulletinBoard.getBoardHash()

    if (!data.currentBoardHash || !data.currentTime) {
      throw new Error('Could not get latest board hash');
    }

    const acknowledgedBoard = {
      currentBoardHash: data.currentBoardHash,
      currentTime: data.currentTime
    }
    return acknowledgedBoard
  }
}

interface BulletinBoard {
  getBoardHash: () => any;
  submitVotes: (contentHash: HashValue, signature: Signature, cryptogramsWithProofs: ContestMap<CryptogramWithProof>) => any
}

type CryptogramWithProof = {
  cryptogram: Cryptogram;
  proof: Proof;
}

type Proof = string
type Cryptogram = string
type Signature = string;
type HashValue = string;