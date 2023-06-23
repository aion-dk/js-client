import { expect } from "chai";
import {AVCrypto} from "../../lib/av_crypto";
import {fixedPoint1Hex} from "./test_helpers";
import {pattern as cryptogramPattern} from "../../lib/av_crypto/el_gamal/cryptogram";

describe("AVCrypto", () => {
  describe("constructor", () => {
    it("constructs an AV Crypto instance", () => {
      const curveName = "secp256k1";
      const crypto = new AVCrypto(curveName)

      expect(crypto).to.be.an.instanceof(AVCrypto);
    })

    context("with valid curve names", () => {
      const supportedCurveNames = ['secp256k1', 'secp256r1', 'secp384r1', 'secp521r1']

      it("constructs an AV Crypto instance", () => {
        supportedCurveNames.forEach( curveName => {
          expect(new AVCrypto(curveName)).to.be.an.instanceof(AVCrypto);
        })
      })
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

  describe("encryptVote()", () => {
    const curveName = "secp256k1";
    const crypto = new AVCrypto(curveName)
    const curve = crypto.curve
    const vote = new TextEncoder().encode("vote")
    const encryptionKey = fixedPoint1Hex(curve)

    it("returns 1 cryptogram and 1 randomizer", () => {
      const {cryptograms, randomizers} = crypto.encryptVote(vote, encryptionKey)

      expect(cryptograms.length).to.eql(1)
      expect(randomizers.length).to.eql(1)
      expect(cryptograms[0]).match(cryptogramPattern(curve))
      expect(randomizers[0]).match(curve.scalarHexPattern())
    })

    context("a vote that fits in multiple cryptograms", () => {
      const vote = new Uint8Array(Array(32).fill(255))

      it("returns multiple cryptograms and randomizers", () => {
        const {cryptograms, randomizers} = crypto.encryptVote(vote, encryptionKey)

        expect(cryptograms.length).to.eql(2)
        expect(randomizers.length).to.eql(2)
      })
    })
  })
})
