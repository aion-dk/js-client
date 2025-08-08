import { BoardItem, ItemExpectation } from '../types'
import {AVCrypto, hexDigest} from "@assemblyvoting/av-crypto";
import {Uniformer} from '../../util/uniformer';

export function signPayload(crypto: AVCrypto, obj: Record<string, unknown>, privateKey: string) {
  const uniformer = new Uniformer();
  const uniformPayload = uniformer.formString(obj);

  const signature = crypto.sign(uniformPayload, privateKey);

  return {
    ...obj,
    signature
  }
}

export function validatePayload(crypto: AVCrypto, item: BoardItem, expectations: ItemExpectation, signaturePublicKey?: string): void {
  if(expectations.type != item.type) {
    throw new Error(`BoardItem did not match expected type '${expectations.type}'`);
  }

  if(expectations.parentAddress != item.parentAddress) {
    throw new Error(`BoardItem did not match expected parent address ${expectations.parentAddress}`);
  }

  if(expectations.content !== undefined) {
    const requiredContentAttributes = Object.keys(expectations.content)
    const itemContent = Object.fromEntries(Object.entries(item.content).filter(([key]) => requiredContentAttributes.includes(key)));
    verifyContent(itemContent, expectations.content);
  }

  verifyAddress(item);

  if(signaturePublicKey !== undefined) {
    verifySignature(crypto, item, signaturePublicKey);
  }
}

function verifySignature(crypto: AVCrypto, item: BoardItem, signaturePublicKey: string): void {
  const uniformer = new Uniformer();
  const signedPayload = uniformer.formString({
    content: item.content,
    type: item.type,
    parentAddress: item.parentAddress
  });

  if(!crypto.isValidSignature(item.signature, signedPayload, signaturePublicKey)) {
    throw new Error('Board signature verification failed');
  }
}

function verifyContent(actual: Record<string, unknown>, expectations: Record<string, unknown>): void {
  const uniformer = new Uniformer();

  const expectedContent = uniformer.formString(expectations);
  const actualContent = uniformer.formString(actual);

  if(expectedContent != actualContent) {
    throw new Error('Item payload failed sanity check. Received item did not match expected');
  }
}

export function verifyAddress(item: BoardItem): void {
  const uniformer = new Uniformer();

  const addressHashSource = uniformer.formString({
    type: item.type,
    content: item.content,
    parentAddress: item.parentAddress,
    previousAddress: item.previousAddress,
    registeredAt: item.registeredAt
  });

  const expectedItemAddress = hexDigest(addressHashSource);

  if(item.address != expectedItemAddress) {
    throw new Error(`BoardItem address does not match expected address '${expectedItemAddress}'`);
  }
}

export function validateReceipt(crypto: AVCrypto, items: BoardItem[], receipt: string, publicKey: string): void {
  const uniformer = new Uniformer();

  const content = {
    signature: items[0].signature,
    address: items[items.length-1].address
  }

  const message = uniformer.formString(content);

  if(!crypto.isValidSignature(receipt, message, publicKey)) {
    throw new Error('Board receipt verification failed');
  }
}
