import { BoardItem, ItemExpectation } from './types'
import * as Crypto from './aion_crypto';
import {Uniformer} from '../util/uniformer';

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
  if(expectations.type != item.type) {
    throw new Error(`BoardItem did not match expected type '${expectations.type}'`);
  }

  if(expectations.parentAddress != item.parentAddress) {
    throw new Error(`BoardItem did not match expected parent address ${expectations.parentAddress}`);
  }

  

  if(expectations.content !== undefined) {
    const requiredContentAttributes = Object.keys(expectations.content)

    const itemContent = Object.fromEntries(Object.entries(item.content).filter(([key]) => requiredContentAttributes.includes(key)));

    console.log("TEST");
    console.log(requiredContentAttributes);
    console.log(itemContent);
    
    verifyContent(itemContent, expectations.content);
  }

  verifyAddress(item);

  if(signaturePublicKey !== undefined) {
    verifySignature(item, signaturePublicKey);
  }
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
