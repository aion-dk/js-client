import { expect } from "chai";
import {Curve} from "../../../lib/av_crypto/curve";
import {Polynomial} from "../../../lib/av_crypto/threshold/polynomial";
import {generateKeyPair} from "../../../lib/av_crypto/utils";
import * as sjcl from "sjcl-with-all";

describe("Threshold polynomial", () => {
  const curve = new Curve('k256')
  const keyPair1 =  generateKeyPair(curve, new sjcl.bn(1))
  const keyPair2 =  generateKeyPair(curve, new sjcl.bn(2))
  const keyPair3 =  generateKeyPair(curve, new sjcl.bn(3))
  const coefficients = [keyPair1, keyPair2, keyPair3];
  const polynomial = new Polynomial(coefficients, curve)

  describe ("constructor", () => {
    it ("constructs a polynomial", () => {
      expect(polynomial.coefficients).to.equal(coefficients)
    })
  })

  describe("evaluateAt()", () => {
    const x = new sjcl.bn(10)

    it ("returns the correct value", () => {
      expect(polynomial.evaluateAt(x)).to.be.eql(new sjcl.bn((1 * (10**0)) + (2 * (10**1)) + (3 * (10**2))))
    })
  })
})
