import { ContestIndexed as ContestMap, OpenableEnvelope } from './types'
import { AcknowledgedBoardHash, signVotes, sealEnvelopes, assertValidReceipt, encryptAES, fingerprint } from './sign'

type Affidavit = string

type SignAndSubmitArguments = {
  voterIdentifier: string;
  electionId: number;
  encryptedVotes: ContestMap<OpenableEnvelope>;
  voterPrivateKey: string;
  electionSigningPublicKey: string,
  encryptedAffidavit: string
}

type AffidavitConfig = {
  curve: string;
  encryptionKey: string;
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

  encryptAffidavit(affidavit: Affidavit, affidavitConfig: AffidavitConfig): string {
    return encryptAES(affidavit, affidavitConfig)
  }

  async signAndSubmitVotes(args: SignAndSubmitArguments): Promise<BallotBoxReceipt> {
    const { voterIdentifier, electionId, encryptedVotes, voterPrivateKey, electionSigningPublicKey, encryptedAffidavit } = args

    const acknowledgeResponse = await this.acknowledge()

    const contentToSign = {
      acknowledged_at: acknowledgeResponse.currentTime,
      acknowledged_board_hash: acknowledgeResponse.currentBoardHash,
      election_id: electionId,
      ...(typeof encryptedAffidavit !== 'undefined') && {encrypted_affidavit_hash: fingerprint(encryptedAffidavit)},
      voter_identifier: voterIdentifier
    };

    const { contentHash, voterSignature } = signVotes(encryptedVotes, voterPrivateKey, contentToSign);
    const cryptogramsWithProofs = sealEnvelopes(encryptedVotes)

    const ballotBoxReceipt = await this.submit({ contentHash, voterSignature, cryptogramsWithProofs, encryptedAffidavit })
    //console.log(ballotBoxReceipt, voterSignature)
    assertValidReceipt({ contentHash, voterSignature, receipt: ballotBoxReceipt, electionSigningPublicKey });

    return ballotBoxReceipt
  }

  private async submit({ contentHash, voterSignature, cryptogramsWithProofs, encryptedAffidavit }) {
    const { data } = await this.bulletinBoard.submitVotes(contentHash, voterSignature, cryptogramsWithProofs, encryptedAffidavit)

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
  submitVotes: (contentHash: HashValue, signature: Signature, cryptogramsWithProofs: ContestMap<CryptogramWithProof>, encryptedAffidavit: HashValue) => any
}

type CryptogramWithProof = {
  cryptogram: Cryptogram;
  proof: Proof;
}

type Proof = string
type Cryptogram = string
type Signature = string;
type HashValue = string;