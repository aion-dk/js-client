import {Curve} from "../../lib/av_crypto/curve";
import * as sjcl from "../../lib/av_crypto/sjcl/sjcl";
import {
  BigNumber,
  SjclECCPublicKey,
  SjclECCSecretKey,
  SjclEllipticalPoint,
  SjclKeyPair
} from "../../lib/av_crypto/sjcl/sjcl";
import {hashIntoScalar} from "../../lib/av_crypto/utils";

export function fixedKeyPair(curve: Curve, context: string): SjclKeyPair<SjclECCPublicKey, SjclECCSecretKey> {
  const seed = "fixed_keypair"
  const private_key = hashIntoScalar(seed, curve)

  return sjcl.ecc[context].generateKeys(curve.curve(), undefined, private_key);
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

  return keyPair.pub._point;
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

  return keyPair.pub._point;
}

export function hexString(hex: string): string {
  return hex.replace(/\s/g, "")
}
