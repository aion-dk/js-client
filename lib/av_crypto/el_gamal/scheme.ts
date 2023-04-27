import {
  SjclElGamalPublicKey, SjclElGamalSecretKey,
  SjclEllipticalPoint,
  SjclKeyPair
} from "../sjcl/sjcl";
import * as sjcl from "../sjcl/sjcl";
import {addPoints} from "../utils";
import {Cryptogram} from "./cryptogram";
import {Curve} from "../curve";

export function encrypt(
  message: SjclEllipticalPoint,
  encryptionKey: SjclEllipticalPoint,
  curve: Curve,
  randomness?: SjclKeyPair<SjclElGamalPublicKey, SjclElGamalSecretKey>
): Cryptogram {

  if (randomness === undefined) {
    randomness = sjcl.ecc.elGamal.generateKeys(curve.curve())
  }

  const r = randomness.pub._point
  const c = addPoints([encryptionKey.mult(randomness.sec._exponent), message])

  return new Cryptogram(r, c)
}
