import { expect } from "chai";
import { ProofOfElectionCodes } from "../../lib/av_client/crypto/proof_of_election_codes";
import { DiscreteLogarithmProof, Curve } from "../../lib/av_client/aion_crypto.js"
import { pointFromHex } from "../../lib/av_client/crypto/util";

describe("Proof of election codes", () => {

  it("converts a single election code into a keyPair", () => {
    const electionCode = 's3cr3t5';

    const proof = new ProofOfElectionCodes([electionCode]);

    expect(proof.mainKeyPair).to.eql({
      privateKey: "631a1838f1e82b7b39f2b620a790de69ca8feb0cfd4ba984350a5fe3a2fda299",
      publicKey: "021d1ccab6d4bc1e4cea12a13d291b2f5772f0c10e8ed4ac4c30be348137005759",
    });
  })

  it("converts multiple election codes into a keyPair", () => {
    const electionCodes = ['s3cr3t5','t0','k33p'];

    const proof = new ProofOfElectionCodes(electionCodes);

    expect(proof.mainKeyPair).to.eql({
      privateKey: "e71d8edd52ff20ff8a741a9ae0f651193e183eafd639ebde02c847b2a35f9a8d",
      publicKey: "020936bd7dacd0bfc974c717877fff2b0c4257a3ef0ea545b6acca9fa3e7857463"
    });
  })

  it("generates a discrete logarithm proof", () => {
    const electionCodes = ['s3cr3t5','t0','k33p'];

    const proof = new ProofOfElectionCodes(electionCodes);
    const discreteLogarithmProof = DiscreteLogarithmProof.fromString(proof.proof);

    expect(proof.proof).to.exist;
    const publicKey = pointFromHex(proof.mainKeyPair.publicKey).toEccPoint();
    expect(discreteLogarithmProof.verifyWithoutChallenge(Curve.G, publicKey)).to.be.true;
  })
})

