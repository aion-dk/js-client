import { expect } from "chai";
import {fixedPoint1, fixedPoint1Hex, fixedScalar2, fixedScalar2Hex} from "./test_helpers";
import {Curve} from "../../lib/av_crypto/curve";
import {fromString, pattern, Proof} from "../../lib/av_crypto/discrete_logarithm/proof";

describe("Discrete logarithm proof", () => {
  const curve = new Curve('k256')
  const k = fixedPoint1(curve)
  const r = fixedScalar2(curve)
  const proof = new Proof(k, r, curve)

  describe ("constructor", () => {
    it ("constructs a cryptogram", () => {
      expect(proof.k).to.equal(k)
      expect(proof.r).to.equal(r)
    })
  })

  describe("toString()", () => {
    it ("returns the right pattern", () => {
      expect(proof.toString()).to.match(pattern(curve))
    })
  })

  describe("pattern()", () => {
    it ("returns the right value", () => {
      expect(pattern(curve).source).to.equal(
        "^(((?:02|03)([a-f0-9]{64})|00),([a-f0-9]{64}))$"
      )
    })
  })

  describe("fromString()", () => {
    const string = [fixedPoint1Hex(curve), fixedScalar2Hex(curve)].join(',')
    it ("constructs the right cryptogram", () => {
      const proof = fromString(string, curve)
      expect(proof.k).to.eql(fixedPoint1(curve))
      expect(proof.r).to.eql(fixedScalar2(curve))
    })

    context("when given malformatted string", () => {
      const string = "a,b"
      it ("throws error", () => {
        expect(() => {
          fromString(string, curve)
        }).to.throw("input must match " + pattern(curve).source)
      })
    })
  })
})
