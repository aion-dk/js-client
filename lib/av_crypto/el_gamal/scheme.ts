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
