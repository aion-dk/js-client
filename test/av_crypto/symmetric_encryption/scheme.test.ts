import { expect } from "chai";
import {fixedPoint1, fixedPoint2, fixedScalar1} from "../test_helpers";
import {Curve} from "../../../lib/av_crypto/curve";
import {decrypt, encrypt} from "../../../lib/av_crypto/symmetric_encryption/scheme";
import {Ciphertext} from "../../../lib/av_crypto/symmetric_encryption/ciphertext";
import * as sjcl from "sjcl-with-all";

describe("Symmetric Encryption scheme", () => {
  const curve = new Curve('k256')
  const encryptionKey = fixedPoint1(curve)
  const message = 'hello'

  describe("encrypt()", () => {
    it ("returns a ciphertext", () => {
      const ciphertext = encrypt(message, encryptionKey, curve)

      expect(ciphertext).to.be.instanceof(Ciphertext);
    })

    context ("when curve is secp521r1", () => {
      const curve = new Curve('c521')
      const encryptionKey = fixedPoint1(curve)

      it ("returns a ciphertext", () => {
        const ciphertext = encrypt(message, encryptionKey, curve)

        expect(ciphertext).to.be.instanceof(Ciphertext);
      })
    })
  })

  describe("decrypt()", () => {
    const decryptionKey = fixedScalar1(curve)
    const ciphertext = new Ciphertext(
      sjcl.codec.base64.toBits("zBjehPc="),
      sjcl.codec.base64.toBits("Vk4emH3FkC4ArxZFsYBIpQ=="),
      sjcl.codec.base64.toBits("/KYhqGcq/oF9j4tS"),
      fixedPoint2(curve)
    )

    it("returns the correct message", () => {
      const decrypted = decrypt(ciphertext, decryptionKey, curve)

      expect(decrypted).to.eql(message)
    })

    context("when curve is secp521r1", () => {
      const curve = new Curve('c521')
      const decryptionKey = fixedScalar1(curve)
      const ciphertext = new Ciphertext(
        sjcl.codec.base64.toBits("6W2b7Fs="),
        sjcl.codec.base64.toBits("S/gH4sI9C/aqVHYQrJ4adQ=="),
        sjcl.codec.base64.toBits("GoUG5+QYOoznKTTU"),
        fixedPoint2(curve)
      )

      it("returns the correct message", () => {
        const decrypted = decrypt(ciphertext, decryptionKey, curve)

        expect(decrypted).to.eql(message)
      })
    })
  })
})
