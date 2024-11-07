import { expect } from "chai";
import {describe} from "mocha";
import * as sjcl from "sjcl-with-all";
import {Curve} from "../../../../lib/av_crypto/curve";
import {
  aggregateSignatures,
  computeGroupCommitment,
  isValid,
  partialSign
} from "../../../../lib/av_crypto/schnorr/frost/scheme";
import * as schnorrScheme from "../../../../lib/av_crypto/schnorr/scheme"
import {
  fixedKeyPair,
  fixedKeyPair2,
  fixedPoint1,
  fixedPoint2,
  fixedScalar1,
  fixedScalar2,
  hexString
} from "../../test_helpers";
import {SingleUseNonce} from "../../../../lib/av_crypto/schnorr/frost/single_use_nonce";
import {CommitmentShare} from "../../../../lib/av_crypto/schnorr/frost/commitment_share";
import {addPoints, addScalars, hexToScalar, scalarToHex} from "../../../../lib/av_crypto/utils";
import {Polynomial} from "../../../../lib/av_crypto/threshold/polynomial";
import {computePublicShare} from "../../../../lib/av_crypto/threshold/scheme";
import {deriveChallenge} from "../../../../lib/av_crypto/schnorr/scheme";

describe("Schnorr FROST threshold signature scheme", () => {
  const curve = new Curve('k256')
  const message = "hello"
  const id1 = new sjcl.bn(42)
  const id2 = new sjcl.bn(2)
  const keyPair1 = fixedKeyPair(curve);
  const keyPair2 = fixedKeyPair2(curve);
  const polynomial1 = new Polynomial([keyPair1, keyPair2], curve)
  const polynomial2 = new Polynomial([keyPair2, keyPair1], curve)
  const partialPrivateShare11 = polynomial1.evaluateAt(id1);
  const partialPrivateShare12 = polynomial2.evaluateAt(id1);
  const partialPrivateShare21 = polynomial1.evaluateAt(id2);
  const partialPrivateShare22 = polynomial2.evaluateAt(id2);
  const privateShare1 = addScalars([partialPrivateShare11, partialPrivateShare12], curve)
  const privateShare2 = addScalars([partialPrivateShare21, partialPrivateShare22], curve)
  const nonce1 = new SingleUseNonce(fixedScalar1(curve), fixedScalar2(curve))
  const nonce2 = new SingleUseNonce(fixedScalar2(curve), fixedScalar1(curve))
  const commitments = [
    new CommitmentShare(id1, fixedPoint1(curve), fixedPoint2(curve), curve),
    new CommitmentShare(id2, fixedPoint2(curve), fixedPoint1(curve), curve),
  ]

  describe("partialSign()", () => {
    it("returns a partial signature", () => {
      const signature = partialSign(message, privateShare1, id1, nonce1, commitments, curve)

      expect(scalarToHex(signature, curve)).to.equal(hexString(
        "1896251c 9dbcf4c7 f6c29cc4 88c531d7" +
        "f9756907 658645e3 03193d5f d61c491b"
      ));
    })
  })

  describe("isValid()", () => {
    const partialSignature = hexToScalar(hexString(
      "1896251c 9dbcf4c7 f6c29cc4 88c531d7" +
      "f9756907 658645e3 03193d5f d61c491b"
    ), curve)
    const publicKeys = [keyPair1.pub.H, keyPair2.pub.H]
    const coefficients = [[keyPair2.pub.H], [keyPair1.pub.H]]
    const publicShare = computePublicShare(id1, publicKeys, coefficients, curve)

    it("returns true", () => {
      const valid = isValid(message, partialSignature, publicShare, id1, commitments, curve)

      expect(valid).to.be.true
    })

    context("with id not included in commitments", () => {
      const id = new sjcl.bn(100)
      it("throws error", () => {
        expect(() => {
          isValid(message, partialSignature, publicShare, id, commitments, curve)
        }).to.throw("id must be included in the list of commitments")
      })
    })

    context("with different message", () => {
      const message = "different"
      it("returns false", () => {
        const valid = isValid(message, partialSignature, publicShare, id1, commitments, curve)

        expect(valid).to.be.false
      })
    })

    context("with different partial signature", () => {
      const partialSignature = new sjcl.bn(100)
      it("returns false", () => {
        const valid = isValid(message, partialSignature, publicShare, id1, commitments, curve)

        expect(valid).to.be.false
      })
    })

    context("with different id", () => {
      it("returns false", () => {
        const valid = isValid(message, partialSignature, publicShare, id2, commitments, curve)

        expect(valid).to.be.false
      })
    })
  })

  describe("aggregateSignatures()", () => {
    const groupCommitment = computeGroupCommitment(commitments, message, curve)
    const challenge = deriveChallenge(message, groupCommitment, curve)
    const partialSignature1 = partialSign(message, privateShare1, id1, nonce1, commitments, curve)
    const partialSignature2 = partialSign(message, privateShare2, id2, nonce2, commitments, curve)
    const publicKey = addPoints([keyPair1.pub.H, keyPair2.pub.H])

    it("returns a valid Schnorr signature", () => {
      const signature = aggregateSignatures(challenge, [partialSignature1, partialSignature2], curve)

      expect(schnorrScheme.isValid(signature, message, publicKey, curve)).to.be.true
    })
  })
})
