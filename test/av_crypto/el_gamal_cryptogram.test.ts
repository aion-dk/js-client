import { expect } from "chai";
import {fixedPoint1, fixedPoint1Hex, fixedPoint2, fixedPoint2Hex} from "./test_helpers";
import {Curve} from "../../lib/av_crypto/curve";
import {Cryptogram, pattern, fromString} from "../../lib/av_crypto/el_gamal/cryptogram";

describe("ElGamal cryptogram", () => {
  const curve = new Curve('k256')
  const r = fixedPoint1(curve)
  const c = fixedPoint2(curve)
  const cryptogram = new Cryptogram(r, c)

  describe ("constructor", () => {
    it ("constructs a cryptogram", () => {
      expect(cryptogram.r).to.equal(r)
      expect(cryptogram.c).to.equal(c)
    })
  })

  describe("toString()", () => {
    it ("returns the right pattern", () => {
      expect(cryptogram.toString()).to.match(pattern(curve))
    })
  })

  describe("pattern()", () => {
    it ("returns the right value", () => {
      expect(pattern(curve).source).to.equal(
        "^(((?:02|03)([a-f0-9]{64})|00),((?:02|03)([a-f0-9]{64})|00))$"
      )
    })
  })

  describe("fromString()", () => {
    const string = [fixedPoint1Hex(curve), fixedPoint2Hex(curve)].join(',')
    it ("constructs the right cryptogram", () => {
      const cryptogram = fromString(string, curve)
      expect(cryptogram.r).to.eql(fixedPoint1(curve))
      expect(cryptogram.c).to.eql(fixedPoint2(curve))
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
