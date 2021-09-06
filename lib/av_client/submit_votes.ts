const Crypto = require('./aion_crypto.js')()
import { ContestIndexed as ContestMap, EncryptedVote } from './types'
import { AcknowledgedBoardHash, signVotes } from './sign'


type Affidavit = string

type SignAndSubmitArguments = {
  voterIdentifier: string;
  electionId: number;
  voteEncryptions: ContestMap<EncryptedVote>;
  privateKey: string;
  signatureKey: string,
  affidavit: Affidavit
}

export default class SubmitVotes {
  bulletinBoard: BulletinBoard;

  constructor(bulletinBoard: BulletinBoard) {
    this.bulletinBoard = bulletinBoard;
  }

  async signAndSubmitVotes({ voterIdentifier, electionId, voteEncryptions, privateKey, signatureKey, affidavit }: SignAndSubmitArguments) {
    const acknowledgeResponse = await this.acknowledge()

    const { contentHash, voterSignature, cryptogramsWithProofs } = signVotes(voteEncryptions, acknowledgeResponse, electionId, voterIdentifier, privateKey);

    const receipt = await this.submit({ contentHash, voterSignature, cryptogramsWithProofs })
    await this.verifyReceipt({ contentHash, voterSignature, receipt, signatureKey });

    return receipt
  }

  private async submit({ contentHash, voterSignature, cryptogramsWithProofs }) {
    const { data } = await this.bulletinBoard.submitVotes(contentHash, voterSignature, cryptogramsWithProofs)

    if (data.error) {
      return Promise.reject(data.error.description)
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
      return Promise.reject('Could not get latest board hash');
    }

    const acknowledgedBoard = {
      currentBoardHash: data.currentBoardHash,
      currentTime: data.currentTime
    }
    return acknowledgedBoard
  }


  private async verifyReceipt({ contentHash, voterSignature, receipt, signatureKey }) {
    // verify board hash computation
    const boardHashObject = {
      content_hash: contentHash,
      previous_board_hash: receipt.previousBoardHash,
      registered_at: receipt.registeredAt
    }
    const boardHashString = JSON.stringify(boardHashObject)
    const computedBoardHash = Crypto.hashString(boardHashString)

    if (computedBoardHash != receipt.boardHash) {
      return Promise.reject('Invalid vote receipt: corrupt board hash')
    }

    // verify server signature
    const receiptHashObject = {
      board_hash: receipt.boardHash,
      signature: voterSignature
    }
    const receiptHashString = JSON.stringify(receiptHashObject)
    const receiptHash = Crypto.hashString(receiptHashString)

    if (!Crypto.verifySchnorrSignature(receipt.serverSignature, receiptHash, signatureKey)) {
      return Promise.reject('Invalid vote receipt: corrupt server signature')
    }

    return Promise.resolve()
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
type PrivateKey = string
type HashValue = string;

type VoteReceipt = {
  previousBoardHash: HashValue;
  boardHash: HashValue;
  registeredAt: string;
  serverSignature: Signature
}
