import {
  electionCodeToPrivateKey,
  addBigNums,
  generateDiscreteLogarithmProof,
  generateKeyPair,
} from "../aion_crypto.js";
import {KeyPair} from "../types";

export class ProofOfElectionCodes {
  readonly proof: string;
  readonly mainKeyPair: KeyPair;

  constructor(electionCodes : Array<string>) {
    const privateKey = <string>electionCodes
      .map(electionCode => electionCodeToPrivateKey(electionCode))
      .reduce(addBigNums);
    this.proof = generateDiscreteLogarithmProof(privateKey);
    const { public_key: publicKey } = generateKeyPair(privateKey);
    this.mainKeyPair = { privateKey, publicKey }
  }
}