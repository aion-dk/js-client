import { expect } from "chai";
import * as sjcl from "sjcl-with-all";
import {decrypt, encrypt} from "../../lib/av_crypto/symmetric_encryption/aes";

describe("AES Encryption", () => {
  const message = 'hello'
  const key = sjcl.codec.utf8String.toBits('my nice 32 characters string key')

  describe ("encrypt()", () => {
    it ("returns 3 BitArray values", () => {
      const [ciphertext, tag, iv] = encrypt(key, message)

      expect(ciphertext).to.exist
      expect(tag).to.exist
      expect(iv).to.exist
    })

    context ("when given an initialization vector", () => {
      const inputIV = sjcl.codec.utf8String.toBits('twelve bytes')

      it ("returns deterministic values", () => {
        const [ciphertext, tag, iv] = encrypt(key, message, inputIV)

        expect(sjcl.codec.base64.fromBits(ciphertext)).to.equal("2f0CY6k=")
        expect(sjcl.codec.base64.fromBits(tag)).to.equal("Qm+l3fnLgiqxhw3M91fHmA==")
        expect(sjcl.codec.base64.fromBits(iv)).to.equal("dHdlbHZlIGJ5dGVz")
      })
    })

    context ("with non-32 bytes key", () => {
      const key = new sjcl.bn(1).toBits()

      it ("throws error", () => {
        expect(() => {
          encrypt(key, message)
        }).to.throw("invalid aes key size")
      })
    })
  })

  describe ("decrypt()", () => {
    const ciphertext = sjcl.codec.base64.toBits("2f0CY6k=")
    const tag = sjcl.codec.base64.toBits("Qm+l3fnLgiqxhw3M91fHmA==")
    const iv = sjcl.codec.utf8String.toBits('twelve bytes')

    it ("returns the correct messsage", () => {
      const plaintext = decrypt(key, ciphertext, tag, iv)

      expect(plaintext).to.equal(message)
    })

    context ("with non-32 bytes key", () => {
      const key = new sjcl.bn(1).toBits()

      it ("throws error", () => {
        expect(() => {
          decrypt(key, ciphertext, tag, iv)
        }).to.throw("invalid aes key size")
      })
    })
  })
})
