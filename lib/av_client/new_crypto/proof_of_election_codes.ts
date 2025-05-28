import {ProofOfElectionCodes} from "../types";
import {AVCrypto} from "../../av_crypto";

export function proofOfElectionCodes(crypto: AVCrypto, electionCodes : Array<string>): ProofOfElectionCodes {
    const {privateKey, publicKey, proof} = crypto.generateProofOfElectionCodes(electionCodes)

  return {
    mainKeyPair: {
      privateKey: privateKey,
      publicKey: publicKey
    },
    proof: proof,
  }
}
