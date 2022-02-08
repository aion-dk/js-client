import { BallotBoxReceipt, ContestMap, OpenableEnvelope, SealedEnvelope } from './types'
import * as Crypto from './aion_crypto';
import * as sjcl from './sjcl';
import Uniformer from '../util/uniformer';


export type AcknowledgedBoardHash = {
  currentBoardHash: string;
  currentTime: string;
}

export type AffidavitConfig = {
  curve: string;
  encryptionKey: string;
}

export function encryptAES(payload: string, encryptionConfig: AffidavitConfig): string {
  const pubKey = new sjcl.ecc.elGamal.publicKey(
    sjcl.ecc.curves[encryptionConfig.curve],
    Crypto.pointFromBits(sjcl.codec.hex.toBits(encryptionConfig.encryptionKey))
  )

  return sjcl.encrypt(pubKey, payload)
}

export function fingerprint(encryptedAffidavid: string): string {
  return Crypto.hashString(encryptedAffidavid)
}

export const signPayload = (obj: any, privateKey: string) => {
  const uniformer = new Uniformer();
  const uniformPayload = uniformer.formString(obj);

  const signature = Crypto.generateSchnorrSignature(uniformPayload, privateKey);

  return {
    ...obj,
    signature
  }
}

export const sealEnvelopes = (encryptedVotes: ContestMap<OpenableEnvelope>): ContestMap<string[]> => {
  const sealEnvelope = (envelope: OpenableEnvelope): string[] => {
    const { cryptograms, randomness } = envelope;
    const proofs = randomness.map(randomizer => Crypto.generateDiscreteLogarithmProof(randomizer)) 
    return proofs
  }

  return Object.fromEntries(Object.keys(encryptedVotes).map(k => [k, sealEnvelope(encryptedVotes[k])]))
}

export function assertValidReceipt(contentHash: string, voterSignature: string, receipt: BallotBoxReceipt, electionSigningPublicKey: string): void {
  assertBoardHashComputation(contentHash, receipt);
  assertValidServerSignature(receipt, voterSignature, electionSigningPublicKey);
}

function assertValidServerSignature(receipt: BallotBoxReceipt, voterSignature: string, electionSigningPublicKey: string) {
  const receiptHashObject = {
    board_hash: receipt.boardHash,
    signature: voterSignature
  };

  const receiptHashString = JSON.stringify(receiptHashObject);
  const receiptHash = Crypto.hashString(receiptHashString);

  if (!Crypto.verifySchnorrSignature(receipt.serverSignature, receiptHash, electionSigningPublicKey)) {
    throw new Error('Invalid vote receipt: corrupt server signature');
  }
}

function assertBoardHashComputation(contentHash: string, receipt: BallotBoxReceipt) {
  const boardHashObject = {
    content_hash: contentHash,
    previous_board_hash: receipt.previousBoardHash,
    registered_at: receipt.registeredAt
  };

  const boardHashString = JSON.stringify(boardHashObject);
  const computedBoardHash = Crypto.hashString(boardHashString);

  if (computedBoardHash != receipt.boardHash) {
    throw new Error('Invalid vote receipt: corrupt board hash');
  }
}

function computeNextBoardHash(content: Record<string, unknown>) {
  const contentString = JSON.stringify(content);
  const contentHash = Crypto.hashString(contentString);
  return contentHash;
}
