import { BoardItem, ContestMap, ItemExpectation, OpenableEnvelope } from './types'
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

export const signPayload = (obj: Record<string, unknown>, privateKey: string) => {
  const uniformer = new Uniformer();
  const uniformPayload = uniformer.formString(obj);

  const signature = Crypto.generateSchnorrSignature(uniformPayload, privateKey);

  return {
    ...obj,
    signature
  }
}

export const validatePayload = (item: BoardItem, expectations: ItemExpectation, signaturePublicKey?: string) => {
  if(expectations.content !== undefined) {
    verifyContent(item.content, expectations.content);
  }

  if(expectations.type != item.type) {
    throw new Error(`BoardItem did not match expected type '${expectations.type}'`);
  }

  if(expectations.parentAddress != item.parentAddress) {
    throw new Error(`BoardItem did not match expected parent address ${expectations.parentAddress}`);
  }

  verifyAddress(item);

  if(signaturePublicKey !== undefined) {
    verifySignature(item, signaturePublicKey);
  }
}

export const sealEnvelopes = (encryptedVotes: ContestMap<OpenableEnvelope>): ContestMap<string[]> => {
  const sealEnvelope = (envelope: OpenableEnvelope): string[] => {
    const { randomness } = envelope;
    const proofs = randomness.map(randomizer => Crypto.generateDiscreteLogarithmProof(randomizer));
    return proofs;
  }

  return Object.fromEntries(Object.keys(encryptedVotes).map(k => [k, sealEnvelope(encryptedVotes[k])]))
}

const verifySignature = (item: BoardItem, signaturePublicKey: string) => {
  const uniformer = new Uniformer();
  const signedPayload = uniformer.formString({
    content: item.content,
    type: item.type,
    parentAddress: item.parentAddress
  });

  if(!Crypto.verifySchnorrSignature(item.signature, signedPayload, signaturePublicKey)) {
    throw new Error('Board signature verification failed');
  }
};

const verifyContent = (actual: Record<string, unknown>, expectations: Record<string, unknown>) => {
  const uniformer = new Uniformer();

  const expectedContent = uniformer.formString(expectations);
  const actualContent = uniformer.formString(actual);

  if(expectedContent != actualContent) {
    throw new Error('Item payload failed sanity check. Received item did not match expected');
  }
};

const verifyAddress = (item: BoardItem) => {
  const uniformer = new Uniformer();

  const addressHashSource = uniformer.formString({
    type: item.type,
    content: item.content,
    parentAddress: item.parentAddress,
    previousAddress: item.previousAddress,
    registeredAt: item.registeredAt
  });

  const expectedItemAddress = Crypto.hashString(addressHashSource);

  if(item.address != expectedItemAddress) {
    throw new Error(`BoardItem address does not match expected address '${expectedItemAddress}'`);
  }
}

export const validateReceipt = (items: BoardItem[], receipt: string, publicKey: string) => {
  const uniformer = new Uniformer();

  const content = {
    signature: items[0].signature,
    address: items[items.length-1].address
  }

  const message = uniformer.formString(content);

  if(!Crypto.verifySchnorrSignature(receipt, message, publicKey)) {
    throw new Error('Board receipt verification failed');
  }
}
