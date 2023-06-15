import { expect } from "chai";
import {hkdf, pbkdf2} from "../../lib/av_crypto/key_derivation";
import * as sjcl from "sjcl-with-all";
import {hexString} from "./test_helpers";

describe("Key Derivation", () => {

  describe("pbkdf2()", () => {
    const keyByteLength = 32
    const password = "Chamber of Secrets"

    it ("has the right bit size", () => {
      const key = pbkdf2(password, keyByteLength)

      expect(sjcl.bitArray.bitLength(key)).to.equal(keyByteLength * 8)
      expect(sjcl.codec.hex.fromBits(key)).to.equal(hexString(
        "750c0ca7 c15d771d 185ec0a8 a146ec84" +
        "cb94cc9d 57277a82 5e218dfa 28281a22"
      ));
    })
  })

  describe("hkdf()", () => {
    const keyByteLength = 32
    const inputKey = sjcl.codec.utf8String.toBits("my secret key")

    it("has the right bit size", () => {
      const key = hkdf(inputKey, keyByteLength)

      expect(sjcl.bitArray.bitLength(key)).to.equal(keyByteLength * 8)
      expect(sjcl.codec.hex.fromBits(key)).to.equal(hexString(
        "eb0bcf6a 52734168 196b07e8 a078b979" +
        "b336e78b 4c3d2147 189f664e 34925d7b"
      ));
    })
  })
})
