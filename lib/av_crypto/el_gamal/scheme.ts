import {
  BigNumber,
  SjclECCPublicKey, SjclECCSecretKey,
  SjclEllipticalPoint,
  SjclKeyPair
} from "../sjcl";
import {addPoints, generateKeyPair} from "../utils";
import {Cryptogram} from "./cryptogram";
import {Curve} from "../curve";

export function encrypt(
  message: SjclEllipticalPoint,
  encryptionKey: SjclEllipticalPoint,
  curve: Curve,
  randomness: SjclKeyPair<SjclECCPublicKey, SjclECCSecretKey> = generateKeyPair(curve)
): Cryptogram {

  const r = randomness.pub.H
  const c = addPoints([encryptionKey.mult(randomness.sec.S), message])

  return new Cryptogram(r, c)
}

export function decrypt(
  cryptogram: Cryptogram,
  decryptionKey: BigNumber,
): SjclEllipticalPoint {

  return addPoints([cryptogram.c, cryptogram.r.mult(decryptionKey).negate()])
}

export function homomorphicallyAdd(cryptograms: Array<Cryptogram>): Cryptogram {
  const newR = addPoints(cryptograms.map(cryptogram => cryptogram.r))
  const newC = addPoints(cryptograms.map(cryptogram => cryptogram.c))

  return new Cryptogram(newR, newC);
}
