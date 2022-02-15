import { BallotBoxReceipt, BoardItem, ContestMap, ItemExpectation, OpenableEnvelope, SealedEnvelope } from './types'
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

export const validatePayload = (item: BoardItem, expectations: ItemExpectation, dbbPublicKey: string) => {
  const uniformer = new Uniformer();

  const expectedContent = uniformer.formString(expectations.content);
  const actualContent = uniformer.formString(item.content);

  if(expectedContent != actualContent) {
    throw new Error('Item payload failed sanity check. Received item did not match expected');
  }

  if(expectations.type != item.type) {
    throw new Error(`BoardItem did not match expected type '${expectations.type}'`);
  }

  if(expectations.parent_address != item.parent_address) {
    throw new Error(`BoardItem did not match expected parent address ${expectations.parent_address}`);
  }

  const addressHashSource = uniformer.formString({
    type: item.type,
    content: item.content,
    parentAddress: item.parent_address,
    previousAddress: item.previous_address,
    registeredAt: item.registered_at
  });

  const expectedItemAddress = Crypto.hashString(addressHashSource);

  if(item.address != expectedItemAddress) {
    throw new Error(`BoardItem address does not match expected address '${expectedItemAddress}'`);
  }

  const signedPayload = uniformer.formString({
    content: item.content,
    type: item.type,
    parent_address: item.parent_address
  });

  // console.log('signedPayload', signedPayload);
  // console.log('dbb public key', dbbPublicKey);
  // console.log('item signature', item.signature);

  if(!Crypto.verifySchnorrSignature(item.signature, signedPayload, dbbPublicKey)) {
    throw new Error('Board signature verification failed');
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
