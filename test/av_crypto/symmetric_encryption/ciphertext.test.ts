import { expect } from "chai";
import {fixedPoint1} from "../test_helpers";
import {Curve} from "../../../lib/av_crypto/curve";
import * as sjcl from "sjcl-with-all";
import {Ciphertext} from "../../../lib/av_crypto/symmetric_encryption/ciphertext";

describe("Symmetric Encryption Ciphertext", () => {
  const ciphertext = new sjcl.bn(1).toBits()
  const iv = new sjcl.bn(1).toBits()
  const tag = new sjcl.bn(1).toBits()
  const curve = new Curve('k256')
  const ephemeralPubliKey = fixedPoint1(curve)

  const c = new Ciphertext(ciphertext, tag, iv, ephemeralPubliKey)

  describe ("constructor", () => {
    it ("constructs a ciphertext", () => {
      expect(c).to.be.instanceof(Ciphertext)
      expect(c.ciphertext).to.eql(ciphertext)
      expect(c.tag).to.eql(tag)
      expect(c.iv).to.eql(iv)
      expect(c.ephemeralPublicKey).to.eql(ephemeralPubliKey)
    })
  })
})
