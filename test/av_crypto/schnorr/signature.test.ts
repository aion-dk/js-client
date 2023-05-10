import { expect } from "chai";
import {
  fixedScalar1,
  fixedScalar1Hex,
  fixedScalar2, fixedScalar2Hex
} from "../test_helpers";
import {Curve} from "../../../lib/av_crypto/curve";
import {fromString, pattern, Signature} from "../../../lib/av_crypto/schnorr/signature";

describe("Schnorr signature", () => {
  const curve = new Curve('k256')
  const e = fixedScalar1(curve)
  const s = fixedScalar2(curve)

  describe ("constructor", () => {
    const signature = new Signature(e, s, curve)

    it ("constructs a commitment", () => {
      expect(signature.e).to.equal(e)
      expect(signature.s).to.equal(s)
    })
  })

  describe("toString()", () => {
    const signature = new Signature(e, s, curve)

    it ("returns the right pattern", () => {
      expect(signature.toString()).to.match(pattern(curve))
    })
  })

  describe("pattern()", () => {
    it ("returns the right value", () => {
      expect(pattern(curve).source).to.equal(
        "^(([a-f0-9]{64}),([a-f0-9]{64}))$"
      )
    })
  })

  describe("fromString()", () => {
    const string = [fixedScalar1Hex(curve), fixedScalar2Hex(curve)].join(',')
    it ("constructs the right signature", () => {
      const signature = fromString(string, curve)
      expect(signature.e).to.eql(fixedScalar1(curve))
      expect(signature.s).to.eql(fixedScalar2(curve))
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
