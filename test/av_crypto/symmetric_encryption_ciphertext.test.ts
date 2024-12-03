import { expect } from "chai";
import {fixedPoint1} from "./test_helpers";
import {Curve} from "../../lib/av_crypto/curve";
import * as sjcl from "sjcl-with-all";
import {Ciphertext, fromString} from "../../lib/av_crypto/symmetric_encryption/ciphertext";

describe("Symmetric Encryption Ciphertext", () => {
  const ciphertext = sjcl.codec.utf8String.toBits("encrypted hello")
  const iv = sjcl.codec.utf8String.toBits("twelve bytes")
  const tag = sjcl.codec.utf8String.toBits("the 16 bytes tag")
  const curve = new Curve('k256')
  const ephemeralPublicKey = fixedPoint1(curve)

  describe("constructor", () => {
    it ("constructs a ciphertext", () => {
      const c = new Ciphertext(ciphertext, tag, iv, ephemeralPublicKey)

      expect(c).to.be.instanceof(Ciphertext)
      expect(c.ciphertext).to.eql(ciphertext)
      expect(c.tag).to.eql(tag)
      expect(c.iv).to.eql(iv)
      expect(c.ephemeralPublicKey).to.eql(ephemeralPublicKey)
    })

    context ("with non-16 bytes tag", () => {
      const tag = new sjcl.bn(1).toBits()

      it ("throws error", () => {
        expect(() => {
          new Ciphertext(ciphertext, tag, iv, ephemeralPublicKey)
        }).to.throw("tag must be a 16 bytes long BitArray")
      })
    })
    context ("with non-12 bytes iv", () => {
      const iv = new sjcl.bn(1).toBits()

      it ("throws error", () => {
        expect(() => {
          new Ciphertext(ciphertext, tag, iv, ephemeralPublicKey)
        }).to.throw("iv must be a 12 bytes long BitArray")
      })
    })
  })

  describe("toString()", () => {
    const c = new Ciphertext(ciphertext, tag, iv, ephemeralPublicKey)

    it("returns the correct string", () => {
      expect(c.toString()).to.eql(
        '{' +
        '"ciphertext":"ZW5jcnlwdGVkIGhlbGxv",' +
        '"tag":"dGhlIDE2IGJ5dGVzIHRhZw==",' +
        '"iv":"dHdlbHZlIGJ5dGVz",' +
        '"ephemeralPublicKey":"02612812a1eca0c506fa67bbbb55a847815a1cd4025799b00fb4af2765ea0a6be4"' +
        '}'
      )
    })
  })

  describe("fromString()", () => {
    const string = '{' +
      '"ciphertext":"ZW5jcnlwdGVkIGhlbGxv",' +
      '"tag":"dGhlIDE2IGJ5dGVzIHRhZw==",' +
      '"iv":"dHdlbHZlIGJ5dGVz",' +
      '"ephemeralPublicKey":"02612812a1eca0c506fa67bbbb55a847815a1cd4025799b00fb4af2765ea0a6be4"' +
      '}'

    it("constructs the right Ciphertext", () => {
      const c = fromString(string, curve)

      expect(c.ciphertext).to.eql(ciphertext)
      expect(c.tag).to.eql(tag)
      expect(c.iv).to.eql(iv)
      expect(c.ephemeralPublicKey).to.eql(ephemeralPublicKey)
    })
  })
})
