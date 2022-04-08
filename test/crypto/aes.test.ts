import { expect } from "chai";
import { dhEncrypt, dhDecrypt, DHPackage } from "../../lib/av_client/crypto/aes";

describe("AES encryption", () => {
  
  it("dhDecrypt result by dhEncrypt", () => {
    const encryptionKeyHex = '037f875fd4daab85767dfd9cf7d653c4997630c6781d273eab07ec84bf69e55766'
    const decryptionKeyHex = '267db52174df6ed70eff93924257bc500ba020d4d0b4abec66e92ee13e27e483'

    const dhPackage = dhEncrypt(encryptionKeyHex, 'This is a secret message!')
    const message = dhDecrypt(decryptionKeyHex, dhPackage)

    expect(message).to.eq('This is a secret message!')
  })

  describe("Payload", () => {

    it("can instantiate DHPackage from string", () => {
      const dhPackageString = `{"ciphertext":"I7gGraOQsmOhBBgOJRzcgkUWt0bF64f8","tag":"IGTwMT/myP5G42pR2ihBjQ==","iv":"jrmBVFSB+W+PNKDn","ephemeralPublicKey":"0288953f883acc28763e95e034b42c17629e259ec3301f38ce896b80972a240558"}`

      expect(() => DHPackage.fromString(dhPackageString)).to.not.throw()
    })

    it("can parse and serialize a DHPackage back to the same value", () => {
      const dhPackageString = `{"ciphertext":"I7gGraOQsmOhBBgOJRzcgkUWt0bF64f8","tag":"IGTwMT/myP5G42pR2ihBjQ==","iv":"jrmBVFSB+W+PNKDn","ephemeralPublicKey":"0288953f883acc28763e95e034b42c17629e259ec3301f38ce896b80972a240558"}`
      const result = DHPackage.fromString(dhPackageString).toString()
  
      expect(result).to.eq(dhPackageString)
    })
  })

  describe(".dhDecrypt()", () => {
    const decryptionKeyHex = "9789c13ded67697c6aae048d26f649098f7f499e61db6968505e38a32c0595e3"
    const dhPackageString = `{"ciphertext":"I7gGraOQsmOhBBgOJRzcgkUWt0bF64f8","tag":"IGTwMT/myP5G42pR2ihBjQ==","iv":"jrmBVFSB+W+PNKDn","ephemeralPublicKey":"0288953f883acc28763e95e034b42c17629e259ec3301f38ce896b80972a240558"}`

    it("can decrypt DHPackage from avx", () => {
      const message = dhDecrypt(decryptionKeyHex, DHPackage.fromString(dhPackageString))
      expect(message).to.eq("This is a secret message")
    })

    it("fails when the decryption key is not matching", () => {
      const wrongDecryptionKeyHex = "037f875fd4daab85767dfd9cf7d653c4997630c6781d273eab07ec84bf69e55766"

      expect(() => {
        dhDecrypt(wrongDecryptionKeyHex, DHPackage.fromString(dhPackageString))
      }).to.throw("gcm: tag doesn't match")
    })
  })
})

