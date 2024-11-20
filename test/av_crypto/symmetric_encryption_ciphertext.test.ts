import { expect } from "chai";
import {fixedPoint1} from "./test_helpers";
import {Curve} from "../../lib/av_crypto/curve";
import * as sjcl from "sjcl-with-all";
import {Ciphertext} from "../../lib/av_crypto/symmetric_encryption/ciphertext";

describe("Symmetric Encryption Ciphertext", () => {
  const ciphertext = sjcl.codec.utf8String.toBits("encrypted hello")
  const iv = sjcl.codec.utf8String.toBits("twelve bytes")
  const tag = sjcl.codec.utf8String.toBits("the 16 bytes tag")
  const curve = new Curve('k256')
  const ephemeralPublicKey = fixedPoint1(curve)

  describe ("constructor", () => {
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
})
