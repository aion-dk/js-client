import { expect } from "chai";
import {AVCrypto} from "../../lib/av_crypto";

describe("AVCrypto", () => {
  describe("constructor", () => {

    it("constructs an AV Crypto instance", () => {
      const curveName = "secp256k1";
      const crypto = new AVCrypto(curveName)

      expect(crypto).to.be.an.instanceof(AVCrypto);
    })

    context.skip("with valid curve names", () => {
      // TODO: try every curve it is supposed to support
    })

    context("with invalid curve name", () => {
      it("throws error", () => {
        const curveName = "invalid";

        expect(() => {
          new AVCrypto(curveName)
        }).to.throw("input must be one of the followings: secp256k1, secp256r1, secp384r1, secp521r1")
      })
    })
  })
})
