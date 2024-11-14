import { expect } from "chai";
import {Curve} from "../../../../lib/av_crypto/curve";
import {SingleUseNonce} from "../../../../lib/av_crypto/schnorr/frost/single_use_nonce";
import {fixedScalar1, fixedScalar2} from "../../test_helpers";

describe("Single use nonce", () => {
  const curve = new Curve('k256')
  const d = fixedScalar1(curve)
  const e = fixedScalar2(curve)

  describe("constructor", () => {
    const nonce = new SingleUseNonce(d, e)

    it ("constructs a SingleUseNonce", () => {
      expect(nonce.d).to.equal(d)
      expect(nonce.e).to.equal(e)
    })
  })
})
