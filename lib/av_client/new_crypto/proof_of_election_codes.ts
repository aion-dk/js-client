import {ProofOfElectionCodes} from "../types";
import {AVCrypto} from "../../av_crypto";

export function proofOfElectionCodes(electionCodes : Array<string>): ProofOfElectionCodes {
    const crypto = new AVCrypto("secp256k1")
    const {privateKey, publicKey, proof} = crypto.generateProofOfElectionCodes(electionCodes)

  return {
    mainKeyPair: {
      privateKey: privateKey,
      publicKey: publicKey
    },
    proof: proof,
  }
}
