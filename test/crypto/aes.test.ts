import { expect } from "chai";
import { dhEncrypt, dhDecrypt, Payload } from "../../lib/av_client/crypto/aes";

describe("AES encryption", () => {
  
  it("dhDecrypt result by dhEncrypt", () => {
    const encryptionKeyHex = '037f875fd4daab85767dfd9cf7d653c4997630c6781d273eab07ec84bf69e55766'
    const decryptionKeyHex = '267db52174df6ed70eff93924257bc500ba020d4d0b4abec66e92ee13e27e483'

    const payload = dhEncrypt(encryptionKeyHex, 'This is a secret message!')
    const message = dhDecrypt(decryptionKeyHex, payload)

    expect(message).to.eq('This is a secret message!')
  })

  describe("Payload", () => {

    it("can instantiate payload from string", () => {
      const payloadString = `{"ciphertext":"I7gGraOQsmOhBBgOJRzcgkUWt0bF64f8","tag":"IGTwMT/myP5G42pR2ihBjQ==","iv":"jrmBVFSB+W+PNKDn","ephemeralPublicKey":"0288953f883acc28763e95e034b42c17629e259ec3301f38ce896b80972a240558"}`

      expect(() => Payload.fromString(payloadString)).to.not.throw()
    })

    it("can parse and serialize a payload back to the same value", () => {
      const payloadString = `{"ciphertext":"I7gGraOQsmOhBBgOJRzcgkUWt0bF64f8","tag":"IGTwMT/myP5G42pR2ihBjQ==","iv":"jrmBVFSB+W+PNKDn","ephemeralPublicKey":"0288953f883acc28763e95e034b42c17629e259ec3301f38ce896b80972a240558"}`
      const result = Payload.fromString(payloadString).toString()
  
      expect(result).to.eq(payloadString)
    })
  })

  describe(".dhDecrypt()", () => {
    const decryptionKeyHex = "9789c13ded67697c6aae048d26f649098f7f499e61db6968505e38a32c0595e3"
    const payloadString = `{"ciphertext":"I7gGraOQsmOhBBgOJRzcgkUWt0bF64f8","tag":"IGTwMT/myP5G42pR2ihBjQ==","iv":"jrmBVFSB+W+PNKDn","ephemeralPublicKey":"0288953f883acc28763e95e034b42c17629e259ec3301f38ce896b80972a240558"}`

    it("can decrypt payload from avx", () => {
      const message = dhDecrypt(decryptionKeyHex, Payload.fromString(payloadString))
      expect(message).to.eq("This is a secret message")
    })

    it("fails when the decryption key is not matching", () => {
      const wrongDecryptionKeyHex = "037f875fd4daab85767dfd9cf7d653c4997630c6781d273eab07ec84bf69e55766"

      expect(() => {
        dhDecrypt(wrongDecryptionKeyHex, Payload.fromString(payloadString))
      }).to.throw("gcm: tag doesn't match")
    })
  })
})

