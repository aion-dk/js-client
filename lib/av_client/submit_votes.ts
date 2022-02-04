import { ContestMap, OpenableEnvelope, SealedEnvelope, Affidavit, BallotBoxReceipt } from './types'
import { AcknowledgedBoardHash, signVotes, sealEnvelopes, assertValidReceipt, encryptAES, fingerprint } from './sign'
import { BulletinBoard } from './connectors/bulletin_board'

type SignAndSubmitArguments = {
  voterIdentifier: string;
  encryptedVotes: ContestMap<OpenableEnvelope>;
  voterPrivateKey: string;
  electionSigningPublicKey: string,
  encryptedAffidavit: string
}

type SubmitArgs = {
  contentHash: string, 
  voterSignature: string,
  cryptogramsWithProofs: ContestMap<SealedEnvelope>
  encryptedAffidavit: string
}

type AffidavitConfig = {
  curve: string;
  encryptionKey: string;
}

export default class SubmitVotes {
  bulletinBoard: BulletinBoard;

  constructor(bulletinBoard: BulletinBoard) {
    this.bulletinBoard = bulletinBoard;
  }

  encryptAffidavit(affidavit: Affidavit, affidavitConfig: AffidavitConfig): string {
    return encryptAES(affidavit, affidavitConfig)
  }
}
