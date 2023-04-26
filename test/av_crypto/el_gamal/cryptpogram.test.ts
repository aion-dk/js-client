import { expect } from "chai";
import {fixedPoint1, fixedPoint2} from "../test_helpers";
import {Curve} from "../../../lib/av_crypto/curve";
import {Cryptogram, pattern} from "../../../lib/av_crypto/el_gamal/cryptogram";

describe("Cryptogram", () => {
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
      const string = cryptogram.toString()
      console.log(string)

      expect(string).to.match(pattern(curve))
    })
  })
})
