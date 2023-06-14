import { expect } from "chai";
import {fixedPoint1} from "../test_helpers";
import {Curve} from "../../../lib/av_crypto/curve";
import {encrypt} from "../../../lib/av_crypto/symmetric_encryption/scheme";
import {Ciphertext} from "../../../lib/av_crypto/symmetric_encryption/ciphertext";

describe("Symmetric Encryption scheme", () => {
  const curve = new Curve('k256')
  const encryptionKey = fixedPoint1(curve)
  const message = 'hello'

  describe("encrypt()", () => {
    it ("returns a ciphertext", () => {
      const ciphertext = encrypt(message, encryptionKey, curve)

      expect(ciphertext).to.be.instanceof(Ciphertext);
    })
  })
})
