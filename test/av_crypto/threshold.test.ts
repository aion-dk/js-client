import { expect } from "chai";
import {fixedPoint1, fixedPoint2, fixedScalar1, fixedScalar2, hexString} from "./test_helpers";
import {Curve} from "../../lib/av_crypto/curve";
import {addPoints, scalarToHex} from "../../lib/av_crypto/utils";
import {
  computeLambda,
  computePartialSecretShare,
  computePublicShare,
  isValidPartialSecretShare
} from "../../lib/av_crypto/threshold";
import * as sjcl from "sjcl-with-all";

describe("Threshold ceremony computation", () => {

  describe("computePublicShare()", () => {
    const curve = new Curve('k256');
    const id = new sjcl.bn(10)
    const publicKeys = [fixedPoint1(curve), fixedPoint2(curve)]
    const coefficients = [[fixedPoint1(curve)], [fixedPoint2(curve)]]

    it ("returns the correct value", () => {
      const p1 = fixedPoint1(curve)
      const p2 = fixedPoint2(curve)
      const expected = addPoints([p1, p1.mult(id), p2, p2.mult(id)])

      const publicShare = computePublicShare(id, publicKeys, coefficients, curve)

      expect(publicShare).to.eql(expected)
    })

    context("with no coefficients", () => {
      const coefficients = []

      it ("returns", () => {
        const publicShare = computePublicShare(id, publicKeys, coefficients, curve)

        expect(publicShare).to.exist
      })
    })

    context("when curve is secp521r1", () => {
      const curve = new Curve('c521');
      const publicKeys = [fixedPoint1(curve), fixedPoint2(curve)]
      const coefficients = [[fixedPoint1(curve)], [fixedPoint2(curve)]]

      it ("returns", () => {
        const publicShare = computePublicShare(id, publicKeys, coefficients, curve)

        expect(publicShare).to.exist
      })
    })
  })

  describe("computePartialSecretShare()", () => {
    const curve = new Curve('k256');
    const id = new sjcl.bn(10)
    const privateKey = fixedScalar1(curve)
    const coefficients = [fixedScalar1(curve), fixedScalar2(curve)]

    it("returns the correct value", () => {
      const s1 = fixedScalar1(curve)
      const s2 = fixedScalar2(curve)
      const expected = s1.add(s1.mul(id)).add(s2.mul(id).mul(id)).mod(curve.order())

      const partialShare = computePartialSecretShare(id, privateKey, coefficients, curve)

      expect(partialShare).to.eql(expected)
    })

    context("with no coefficients", () => {
      const coefficients = []

      it ("returns", () => {
        const partialShare = computePartialSecretShare(id, privateKey, coefficients, curve)

        expect(partialShare).to.exist
      })
    })

    context("when curve is secp521r1", () => {
      const curve = new Curve('c521');
      const privateKey = fixedScalar1(curve)
      const coefficients = [fixedScalar1(curve), fixedScalar2(curve)]

      it ("returns", () => {
        const partialShare = computePartialSecretShare(id, privateKey, coefficients, curve)

        expect(partialShare).to.exist
      })
    })
  })

  describe("isValidPartialSecretShare()", () => {
    const curve = new Curve('k256');
    const id = new sjcl.bn(10)
    const s1 = fixedScalar1(curve)
    const s2 = fixedScalar2(curve)
    const partialShare = s1.add(s1.mul(id)).add(s2.mul(id).mul(id)).mod(curve.order())
    const publicKey = fixedPoint1(curve)
    const coefficients = [fixedPoint1(curve), fixedPoint2(curve)]

    it("validates", () => {
      expect(isValidPartialSecretShare(partialShare, id, publicKey, coefficients, curve)).to.be.true
    })

    context("when computed for different id", () => {
      const id = new sjcl.bn(42)

      it ("doesn't validate", () => {
        expect(isValidPartialSecretShare(partialShare, id, publicKey, coefficients, curve)).to.be.false
      })
    })

    context("when curve is secp521r1", () => {
      const curve = new Curve('k256');
      const id = new sjcl.bn(10)
      const s1 = fixedScalar1(curve)
      const s2 = fixedScalar2(curve)
      const partialShare = s1.add(s1.mul(id)).add(s2.mul(id).mul(id)).mod(curve.order())
      const publicKey = fixedPoint1(curve)
      const coefficients = [fixedPoint1(curve), fixedPoint2(curve)]

      it ("validates", () => {
        expect(isValidPartialSecretShare(partialShare, id, publicKey, coefficients, curve)).to.be.true
      })
    })
  })

  describe("computeLambda()", () => {
    const curve = new Curve('k256');
    const id = new sjcl.bn(10)
    const otherIDs = [new sjcl.bn(26), new sjcl.bn(8)]

    it("returns the correct value", () => {
      const lambda = computeLambda(id, otherIDs, curve)

      expect(scalarToHex(lambda, curve)).to.eql(hexString(
        "7fffffff ffffffff ffffffff ffffffff" +
        "5d576e73 57a4501d dfe92f46 681b209a"
      ))
    })

    context("when curve is secp521r1", () => {
      const curve = new Curve('k256');

      it ("returns", () => {
        const lambda = computeLambda(id, otherIDs, curve)

        expect(lambda).to.exist
      })
    })
  })
})
