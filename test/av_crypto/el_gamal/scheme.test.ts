import { expect } from "chai";
import {encrypt} from "../../../lib/av_crypto/el_gamal/scheme";
import {fixedKeyPair, fixedPoint1, fixedPoint2} from "../test_helpers";
import {Curve} from "../../../lib/av_crypto/curve";
import {Cryptogram} from "../../../lib/av_crypto/el_gamal/cryptogram";

describe("ElGamal", () => {
  const curve = new Curve('k256')
  const encryptionKey = fixedPoint1(curve)
  const message = fixedPoint2(curve)

  describe("encrypt()", () => {
    it ("returns a cryptogram", () => {
      const cryptogram = encrypt(message, encryptionKey, curve)

      expect(cryptogram).to.be.instanceof(Cryptogram);
    })

    context("when given randomness", () => {
      const randomness = fixedKeyPair(curve)

      it ("produces a deterministic cryptogram", () => {
        const cryptogram = encrypt(message, encryptionKey, curve, randomness)

        expect(cryptogram.toString())
          .to.equal(
            (
              "03" +
              "fdb56f2d 282189d5 592305cc cc5ba3f3" +
              "b9e2d6a8 f373b436 4a7a20e1 54bac1b1" +
              "," +
              "03" +
              "16b19bac 2033c9d5 63d0399d 26bfd10b" +
              "a3cba736 aad9fa98 e4daad13 4bd07911"
            ).replace(/\s/g, "")
        );
      })
    })
  })
})
