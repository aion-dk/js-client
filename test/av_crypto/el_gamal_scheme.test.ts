import { expect } from "chai";
import {decrypt, encrypt, homomorphicallyAdd} from "../../lib/av_crypto/el_gamal/scheme";
import {fixedKeyPair, fixedPoint1, fixedPoint2, fixedScalar1, hexString} from "./test_helpers";
import {Curve} from "../../lib/av_crypto/curve";
import {Cryptogram, fromString} from "../../lib/av_crypto/el_gamal/cryptogram";

describe("ElGamal scheme", () => {
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

        expect(cryptogram.toString()).to.equal(hexString(
          "03" +
          "fdb56f2d 282189d5 592305cc cc5ba3f3" +
          "b9e2d6a8 f373b436 4a7a20e1 54bac1b1" +
          "," +
          "03" +
          "16b19bac 2033c9d5 63d0399d 26bfd10b" +
          "a3cba736 aad9fa98 e4daad13 4bd07911"
        ));
      })
    })
  })

  describe("decrypt()", () => {
    const cryptogram = fromString(
      hexString(
        "03" +
        "fdb56f2d 282189d5 592305cc cc5ba3f3" +
        "b9e2d6a8 f373b436 4a7a20e1 54bac1b1" +
        "," +
        "03" +
        "16b19bac 2033c9d5 63d0399d 26bfd10b" +
        "a3cba736 aad9fa98 e4daad13 4bd07911"
      ),
      curve
    );

    it ("returns the correct point", () => {
      const point = decrypt(cryptogram, fixedScalar1(curve))

      expect(point).to.eql(message);
    })
  })

  describe("homomorphicallyAdd()", () => {
    const cryptograms = [
      new Cryptogram(fixedPoint1(curve), fixedPoint2(curve)),
      new Cryptogram(fixedPoint1(curve), fixedPoint2(curve))
    ]

    it ("produces a deterministic cryptogram", () => {
      const sum = homomorphicallyAdd(cryptograms)

      expect(sum.toString()).to.equal(hexString(
        "02" +
        "6da32183 6e35dbff d81be7d4 fabd0a75" +
        "ed48548b 8e1b4847 0f719c7a cd1be877" +
        "," +
        "03" +
        "f9537231 f541273a b4c0c61e 02e6ed1b" +
        "0a90d4db 0ce563c4 734ced28 18050fdb"
      ));
    })
  })
})
