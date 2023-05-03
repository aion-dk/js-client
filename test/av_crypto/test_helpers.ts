import {Curve} from "../../lib/av_crypto/curve";
import * as sjcl from "sjcl-with-all";
import {
  BigNumber,
  SjclElGamalPublicKey,
  SjclElGamalSecretKey,
  SjclEllipticalPoint,
  SjclKeyPair
} from "../../lib/av_crypto/sjcl";
import {hashIntoScalar, pointToHex, scalarToHex} from "../../lib/av_crypto/utils";

export function fixedKeyPair(curve: Curve): SjclKeyPair<SjclElGamalPublicKey, SjclElGamalSecretKey> {
  const seed = "fixed_keypair"
  const private_key = hashIntoScalar(seed, curve)

  return sjcl.ecc.elGamal.generateKeys(curve.curve(), undefined, private_key);
}

export function fixedScalar1(curve: Curve): BigNumber {
  const seed = "fixed value 1"
  const private_key = hashIntoScalar(seed, curve)
  const keyPair = sjcl.ecc.elGamal.generateKeys(curve.curve(), undefined, private_key);

  return keyPair.sec._exponent;
}

export function fixedPoint1(curve: Curve): SjclEllipticalPoint {
  const seed = "fixed value 1"
  const private_key = hashIntoScalar(seed, curve)
  const keyPair = sjcl.ecc.elGamal.generateKeys(curve.curve(), undefined, private_key);

  return keyPair.pub.H;
}

export function fixedScalar2(curve: Curve): BigNumber {
  const seed = "fixed value 2"
  const private_key = hashIntoScalar(seed, curve)
  const keyPair = sjcl.ecc.elGamal.generateKeys(curve.curve(), undefined, private_key);

  return keyPair.sec._exponent;
}

export function fixedPoint2(curve: Curve): SjclEllipticalPoint {
  const seed = "fixed value 2"
  const private_key = hashIntoScalar(seed, curve)
  const keyPair = sjcl.ecc.elGamal.generateKeys(curve.curve(), undefined, private_key);

  return keyPair.pub.H;
}

export function fixedScalar1Hex(curve: Curve): string{
  return scalarToHex(fixedScalar1(curve), curve)
}
export function fixedPoint1Hex(curve: Curve): string{
  return pointToHex(fixedPoint1(curve))
}
export function fixedScalar2Hex(curve: Curve): string{
  return scalarToHex(fixedScalar2(curve), curve)
}
export function fixedPoint2Hex(curve: Curve): string{
  return pointToHex(fixedPoint2(curve))
}

export function hexString(hex: string): string {
  return hex.replace(/\s/g, "")
}
