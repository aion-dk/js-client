import {
  SjclElGamalPublicKey, SjclElGamalSecretKey,
  SjclEllipticalPoint,
  SjclKeyPair
} from "../sjcl";
import * as sjcl from "sjcl-with-all";
import {addPoints} from "../utils";
import {Cryptogram} from "./cryptogram";
import {Curve} from "../curve";

export function encrypt(
  message: SjclEllipticalPoint,
  encryptionKey: SjclEllipticalPoint,
  curve: Curve,
  randomness: SjclKeyPair<SjclElGamalPublicKey, SjclElGamalSecretKey> = sjcl.ecc.elGamal.generateKeys(curve.curve())
): Cryptogram {

  const r = randomness.pub.H
  const c = addPoints([encryptionKey.mult(randomness.sec.S), message])

  return new Cryptogram(r, c)
}

export function homomorphicallyAdd(cryptograms: Array<Cryptogram>, curve: Curve): Cryptogram {
  const newR = addPoints(cryptograms.map(cryptogram => cryptogram.r))
  const newC = addPoints(cryptograms.map(cryptogram => cryptogram.c))

  return new Cryptogram(newR, newC);
}
