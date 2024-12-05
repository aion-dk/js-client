import { expect } from "chai";
import { proofOfElectionCodes } from "../../lib/av_client/new_crypto/proof_of_election_codes";
import {AVCrypto} from "../../lib/av_crypto";
import {pattern as proofPattern} from "../../lib/av_crypto/discrete_logarithm/proof"

describe("proofOfElectionCodes", () => {

  it("converts a single election code into a keyPair", () => {
    const electionCode = 's3cr3t5';

    const proof = proofOfElectionCodes([electionCode]);

    expect(proof.mainKeyPair).to.eql({
      privateKey: "631a1838f1e82b7b39f2b620a790de69ca8feb0cfd4ba984350a5fe3a2fda299",
      publicKey: "021d1ccab6d4bc1e4cea12a13d291b2f5772f0c10e8ed4ac4c30be348137005759",
    });
  })

  it("converts multiple election codes into a keyPair", () => {
    const electionCodes = ['s3cr3t5','t0','k33p'];

    const proof = proofOfElectionCodes(electionCodes);

    expect(proof.mainKeyPair).to.eql({
      privateKey: "e71d8edd52ff20ff8a741a9ae0f651193e183eafd639ebde02c847b2a35f9a8d",
      publicKey: "020936bd7dacd0bfc974c717877fff2b0c4257a3ef0ea545b6acca9fa3e7857463"
    });
  })

  it("generates a discrete logarithm proof", () => {
    const electionCodes = ['s3cr3t5','t0','k33p'];

    const proof = proofOfElectionCodes(electionCodes);

    const crypto = new AVCrypto("secp256k1")
    expect(proof.proof).to.match(proofPattern(crypto.curve));
  })
})
