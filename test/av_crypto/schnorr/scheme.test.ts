import { expect } from "chai";
import {fixedKeyPair, fixedPoint1, fixedPoint2, fixedScalar1, fixedScalar2, hexString} from "../test_helpers";
import {Curve} from "../../../lib/av_crypto/curve";
import {describe} from "mocha";
import {generateKeyPair} from "../../../lib/av_crypto/utils";
import {isValid, sign} from "../../../lib/av_crypto/schnorr/scheme";
import {fromString, Signature} from "../../../lib/av_crypto/schnorr/signature";
import * as sjcl from "sjcl-with-all";

describe("Schnorr signature scheme", () => {
  const curve = new Curve('k256')
  const message = "hello"
  const privateKey = fixedScalar1(curve)

  describe("sign()", () => {
    it("returns a signature", () => {
      const signature = sign(message, privateKey, curve)

      expect(signature).to.be.instanceof(Signature);
    })

    it("can generate non-negative s values", () => {
      const privateKey = new sjcl.bn(1)
      const randomness = generateKeyPair(curve, curve.order().sub(1))
      const signature = sign(message, privateKey, curve, randomness)

      expect(signature).to.be.instanceof(Signature);
      expect(signature.e.greaterEquals(0)).to.equal(1)
      expect(signature.s.greaterEquals(0)).to.equal(1)
    })

    context("when given randomness", () => {
      const randomness = fixedKeyPair(curve)

      it("produces a deterministic signature", () => {
        const signature = sign(message, privateKey, curve, randomness)

        expect(signature.toString()).to.equal(hexString(
          "8ba57000 5baf7b12 9129c7e1 8b0d67a1" +
          "10dd530d 918617df 14cbf092 636e73b6" +
          "," +
          "b8672425 31885b8e 9b1629cc 293bcf46" +
          "2f43f5f6 99e090e3 3adc5af1 9215436e"
        ))
      })
    })

    context("with curve secp521r1", () => {
      const curve = new Curve('c521')
      const privateKey = fixedScalar1(curve)
      const randomness = fixedKeyPair(curve)

      it("returns a deterministic proof", () => {
        const signature = sign(message, privateKey, curve, randomness)
        expect(signature.toString()).to.equal(hexString(
          "0000" +
          "c7eecc52 6c649cec 817bfbab 4e0e32e3" +
          "da2abe46 37ac0542 0dbd4215 c1f2ac4e" +
          "9b00eda0 01154be5 9d8703a8 54caf300" +
          "326e0d2b c35cea08 cc18e006 ad5dbf6b" +
          "," +
          "01c4" +
          "f8411eb7 6104458d 2e0f43bd 971c78a1" +
          "fd7e717a 121b5441 59f8e35e e02e0cd7" +
          "1efd083c b0434fbc 1dd32def c45a335d" +
          "57de6fc1 31a4a347 1d346e40 6a1525b0"
        ));
      })
    })
  })

  describe("isValid()", () => {
    const signature = fromString(hexString(
      "8ba57000 5baf7b12 9129c7e1 8b0d67a1" +
      "10dd530d 918617df 14cbf092 636e73b6" +
      "," +
      "b8672425 31885b8e 9b1629cc 293bcf46" +
      "2f43f5f6 99e090e3 3adc5af1 9215436e"
    ), curve)
    const publicKey = fixedPoint1(curve)

    it("validates", () => {
      expect(isValid(signature, message, publicKey, curve)).to.be.true
    })

    context("with a different message that wasn't in the signing", () => {
      const message = "wrong"

      it("doesn't validate", () => {
        expect(isValid(signature, message, publicKey, curve)).to.be.false
      })
    })

    context("with a different public key that wasn't in the signing", () => {
      const publicKey = fixedPoint2(curve)

      it("doesn't validate", () => {
        expect(isValid(signature, message, publicKey, curve)).to.be.false
      })
    })

    context("with a different signature that wasn't returned by the signing", () => {
      const signature = new Signature(fixedScalar1(curve), fixedScalar2(curve), curve)

      it("doesn't validate", () => {
        expect(isValid(signature, message, publicKey, curve)).to.be.false
      })
    })

    context("with curve secp521r1", () => {
      const curve = new Curve('c521')
      const signature = fromString(hexString(
        "0000" +
        "c7eecc52 6c649cec 817bfbab 4e0e32e3" +
        "da2abe46 37ac0542 0dbd4215 c1f2ac4e" +
        "9b00eda0 01154be5 9d8703a8 54caf300" +
        "326e0d2b c35cea08 cc18e006 ad5dbf6b" +
        "," +
        "01c4" +
        "f8411eb7 6104458d 2e0f43bd 971c78a1" +
        "fd7e717a 121b5441 59f8e35e e02e0cd7" +
        "1efd083c b0434fbc 1dd32def c45a335d" +
        "57de6fc1 31a4a347 1d346e40 6a1525b0"
      ), curve)
      const publicKey = fixedPoint1(curve)

      it("validates", () => {
        expect(isValid(signature, message, publicKey, curve)).to.be.true
      })
    })
  })
})
