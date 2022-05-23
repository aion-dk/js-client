import * as crypto from "../aion_crypto";
import * as sjcl from "../sjcl";

const curve = crypto.Curve

/** 
 * Encrypt an arbitrary amount of (string) data symmetrically.
 * @param {string} encryptionKeyHex The public key of the External Verifier.
 * @param {string} message The plaintext to be encrypted.
 * @return {DHPackage} A package object with the ciphertext, the tag, the iv, and the ephemeral public key.
 */
export function dhEncrypt(encryptionKeyHex: string, message: string): DHPackage {
  // convert hex values to keys
  const point = crypto.pointFromBits(sjcl.codec.hex.toBits(encryptionKeyHex));
  const encryptionKey = new sjcl.ecc.elGamal.publicKey(crypto.Curve, point);

  // derive a symmetric key
  const ephemeralKeyPair = sjcl.ecc.elGamal.generateKeys(curve)

  const symmetricKey = deriveKey(ephemeralKeyPair.sec, encryptionKey)

  const [ciphertext, tag, iv] = encrypt(symmetricKey, message)

  const ephemeralPublicKey = ephemeralKeyPair.pub

  return new DHPackage(
    ciphertext,
    tag,
    iv,
    ephemeralPublicKey
  )
}



/** 
 * Decrypts an arbitrary amount of (string) data symmetrically.
 * @param {string} decryptionKeyHex The decryption key.
 * @param {DHPackage} dhPackage The package as returned by the dhEncrypt.
 * @return {string} The plaintext.
 */
export function dhDecrypt(decryptionKeyHex: string, dhPackage: DHPackage){
  const exponent = sjcl.bn.fromBits(sjcl.codec.hex.toBits(decryptionKeyHex));
  const decryptionKey = new sjcl.ecc.elGamal.secretKey(curve, exponent);  
  const symmetricKey = deriveKey(decryptionKey, dhPackage.ephemeralPublicKey)

  return decrypt(symmetricKey, dhPackage.ciphertext, dhPackage.tag, dhPackage.iv)
}


export class DHPackage {
  public ciphertext
  public tag
  public iv
  public ephemeralPublicKey

  constructor(ciphertext, tag, iv, ephemeralPublicKey){
    this.ciphertext = ciphertext
    this.tag = tag
    this.iv = iv
    this.ephemeralPublicKey = ephemeralPublicKey
  }

  toString(): string {
    return dhPackageToString(this)
  }

  static fromString(json: string): DHPackage {
    return dhPackageFromString(json)
  }

}


// --------- Private functions ---------

function encrypt(symmetricKey, message: string){
  const prf = new sjcl.cipher.aes(symmetricKey);
  const plaintext = sjcl.codec.utf8String.toBits(message)
  const iv = sjcl.bitArray.clamp(sjcl.random.randomWords(4), 12 * 8)
  const adata = []
  const ts = 128
  const ciphertextAndTag = sjcl.mode.gcm.encrypt(prf, plaintext, iv, adata, ts);

  // separate ciphertext from tag
  const cts = sjcl.bitArray.bitLength(ciphertextAndTag);
  const ciphertext = sjcl.bitArray.clamp(ciphertextAndTag, cts - ts)
  const tag = sjcl.bitArray.bitSlice(ciphertextAndTag, cts - ts)

  return [ciphertext, tag, iv]
}

function decrypt(symmetricKey, ciphertext, tag, iv){
  const prf = new sjcl.cipher.aes(symmetricKey);
  const ciphertextAndTag = sjcl.bitArray.concat(ciphertext, tag)
  const adata = []
  const ts = 128
  const plaintext = sjcl.mode.gcm.decrypt(prf, ciphertextAndTag, iv, adata, ts);

  return sjcl.codec.utf8String.fromBits(plaintext)
}

function deriveKey(privateKey, publicKey){
  const sharedSecret = privateKey.dhJavaEc(publicKey)
  const keyLength = 256
  const salt = ''
  const info = ''
  return sjcl.misc.hkdf(sharedSecret, keyLength, salt, info)
}

function dhPackageFromString(json: string): DHPackage {
  const encoded = JSON.parse(json)

  const ciphertext = sjcl.codec.base64.toBits(encoded.ciphertext)
  const tag = sjcl.codec.base64.toBits(encoded.tag)
  const iv = sjcl.codec.base64.toBits(encoded.iv)
  const ephemeralPublicKey = new sjcl.ecc.elGamal.publicKey(
    curve,
    crypto.pointFromBits(sjcl.codec.hex.toBits(encoded.ephemeralPublicKey))
  )

  return new DHPackage(
    ciphertext,
    tag,
    iv,
    ephemeralPublicKey,
  )
}

function dhPackageToString(dhPackage: DHPackage): string {
  const ciphertext = sjcl.codec.base64.fromBits(dhPackage.ciphertext)
  const tag = sjcl.codec.base64.fromBits(dhPackage.tag)
  const iv = sjcl.codec.base64.fromBits(dhPackage.iv)
  const ephemeralPublicKey = sjcl.codec.hex.fromBits(crypto.pointToBits(dhPackage.ephemeralPublicKey._point, true))

  return JSON.stringify({
    ciphertext,
    tag,
    iv,
    ephemeralPublicKey
  })
}

