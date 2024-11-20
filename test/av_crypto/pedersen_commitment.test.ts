import { expect } from "chai";
import {fixedPoint1, fixedScalar2} from "./test_helpers";
import {Curve} from "../../lib/av_crypto/curve";
import {Commitment} from "../../lib/av_crypto/pedersen/commitment";

describe("Pedersen commitment", () => {
  const curve = new Curve('k256')
  const c = fixedPoint1(curve)
  const commitment = new Commitment(c)

  describe ("constructor", () => {
    it ("constructs a commitment", () => {
      expect(commitment.c).to.equal(c)
    })

    context("when given r", () => {
      const r = fixedScalar2(curve)
      const commitment = new Commitment(c, r)

      it ("constructs a commitment", () => {
        expect(commitment.c).to.equal(c)
        expect(commitment.r).to.equal(r)
      })
    })
  })

  describe("isOpenable()", () => {
    it ("returns false", () => {
      expect(commitment.isOpenable()).to.be.false
    })

    context("when given r", () => {
      const r = fixedScalar2(curve)
      const commitment = new Commitment(c, r)

      it ("returns true", () => {
        expect(commitment.isOpenable()).to.be.true
      })
    })
  })
})
