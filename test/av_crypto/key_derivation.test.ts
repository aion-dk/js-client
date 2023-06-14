import { expect } from "chai";
import {hkdf, pbkdf2} from "../../lib/av_crypto/key_derivation";
import * as sjcl from "sjcl-with-all";

describe("Key Derivation", () => {

  describe("pbkdf2()", () => {
    const keyBitLength = 256
    const password = "Chamber of Secrets"

    it ("has the right bit size", () => {
      const key = pbkdf2(password, keyBitLength)

      expect(sjcl.bitArray.bitLength(key)).to.equal(keyBitLength)
    })
  })

  describe("hkdf()", () => {
    const keyBitLength = 256
    const inputKey = sjcl.codec.utf8String.toBits("my secret key")

    it("has the right bit size", () => {
      const key = hkdf(inputKey, keyBitLength)

      expect(sjcl.bitArray.bitLength(key)).to.equal(keyBitLength)
    })
  })
})
