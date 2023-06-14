import {
  BitArray,
  SjclElGamalPublicKey, SjclElGamalSecretKey,
  SjclEllipticalPoint,
  SjclKeyPair
} from "../sjcl";
import {Curve} from "../curve";
import {Ciphertext} from "./ciphertext";
import * as sjcl from "sjcl-with-all";

export function encrypt(
  message: string,
  encryptionKey: SjclEllipticalPoint,
  curve: Curve
): Ciphertext {
  const ephemeralKeyPair = sjcl.ecc.elGamal.generateKeys(curve.curve())
  const derivedKey = deriveKey(ephemeralKeyPair, encryptionKey, curve)


  const bitArray = new sjcl.bn(1).toBits()
  return new Ciphertext(bitArray, bitArray, bitArray, encryptionKey)
}

function deriveKey(secretKeyPair: SjclKeyPair<SjclElGamalPublicKey, SjclElGamalSecretKey>, publicPoint: SjclEllipticalPoint, curve: Curve): BitArray {
  const elGamalPublicPoint = new sjcl.ecc.elGamal.publicKey(curve.curve(), publicPoint)
  const derivedKey = secretKeyPair.sec.dhJavaEc(elGamalPublicPoint)

  return derivedKey
}

