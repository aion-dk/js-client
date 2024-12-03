import {
  BigNumber,
  BitArray,
  SjclElGamalPublicKey, SjclElGamalSecretKey,
  SjclEllipticalPoint,
  SjclKeyPair
} from "../sjcl";
import {Curve} from "../curve";
import {Ciphertext} from "./ciphertext";
import * as sjcl from "sjcl-with-all";
import {hkdf} from "../key_derivation";
import {encrypt as aesEncrypt, decrypt as aesDecrypt, KEY_BYTE_SIZE} from "./aes"

export function encrypt(
  message: string,
  encryptionKey: SjclEllipticalPoint,
  curve: Curve
): Ciphertext {
  const ephemeralKeyPair = sjcl.ecc.elGamal.generateKeys(curve.curve())
  const derivedKey = deriveKey(ephemeralKeyPair, encryptionKey, curve)
  const [ciphertext, tag, iv] = aesEncrypt(derivedKey, message)

  return new Ciphertext(ciphertext, tag, iv, ephemeralKeyPair.pub.H)
}

export function decrypt(ciphertext: Ciphertext, decryptionKey: BigNumber, curve: Curve): string {
  const decryptionKeyPair = sjcl.ecc.elGamal.generateKeys(curve.curve(), null, decryptionKey)
  const derivedKey = deriveKey(decryptionKeyPair, ciphertext.ephemeralPublicKey, curve)

  return aesDecrypt(derivedKey, ciphertext.ciphertext, ciphertext.tag, ciphertext.iv)
}

function deriveKey(secretKeyPair: SjclKeyPair<SjclElGamalPublicKey, SjclElGamalSecretKey>, publicPoint: SjclEllipticalPoint, curve: Curve): BitArray {
  const elGamalPublicPoint = new sjcl.ecc.elGamal.publicKey(curve.curve(), publicPoint)
  const derivedKey = secretKeyPair.sec.dhJavaEc(elGamalPublicPoint)

  return hkdf(derivedKey, KEY_BYTE_SIZE)
}
