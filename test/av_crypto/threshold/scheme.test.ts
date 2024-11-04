import { expect } from "chai";
import {fixedKeyPair, fixedPoint1, fixedPoint2, hexString} from "../test_helpers";
import {Curve} from "../../../lib/av_crypto/curve";
import {addPoints, scalarToHex} from "../../../lib/av_crypto/utils";
import {computeLambda, computePublicShare, generatePolynomial} from "../../../lib/av_crypto/threshold/scheme";
import * as sjcl from "sjcl-with-all";

describe("Threshold ceremony computation ========================================================", () => {

  describe("generatePolynomial()", () => {
    const curve = new Curve('k256');
    const firstCoefficient = fixedKeyPair(curve);
    const degree = 2;
    const polynomial = generatePolynomial(degree, firstCoefficient, curve);

    it("constructs a polynomial", () => {
      expect(polynomial.coefficients.length).to.eql(degree)
      expect(polynomial.coefficients[0]).to.eql(firstCoefficient)
    })
  })

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
      const curve = new Curve('k256');
      const publicKeys = [fixedPoint1(curve), fixedPoint2(curve)]
      const coefficients = [[fixedPoint1(curve)], [fixedPoint2(curve)]]

      it ("returns", () => {
        const publicShare = computePublicShare(id, publicKeys, coefficients, curve)

        expect(publicShare).to.exist
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
