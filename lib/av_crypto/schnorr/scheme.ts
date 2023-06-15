import {
  BigNumber, SjclECCPublicKey, SjclECCSecretKey,
  SjclEllipticalPoint,
  SjclKeyPair
} from "../sjcl";
import {
  concatForHashing,
  generateKeyPair,
  hashIntoScalar, multiplyAndSumScalarsAndPoints,
  pointToHex
} from "../utils";
import {Signature} from "./signature";
import {Curve} from "../curve";

export function isValid(
  signature: Signature,
  message: string,
  publicKey: SjclEllipticalPoint,
  curve: Curve
): boolean {
  const r = computeR(signature, publicKey, curve);
  const recomputedE = computeE(message, r, curve)

  return signature.e.equals(recomputedE)
}

export function sign(
  message: string,
  privateKey: BigNumber,
  curve: Curve,
  randomness: SjclKeyPair<SjclECCPublicKey, SjclECCSecretKey> = generateKeyPair(curve)
): Signature {
  const e = computeE(message, randomness.pub.H, curve)
  const s = computeS(privateKey, randomness.sec.S, e, curve)
  return new Signature(e, s, curve)
}

function computeE(message: string, r: SjclEllipticalPoint, curve: Curve): BigNumber {
  const string = concatForHashing([
    pointToHex(r),
    message
  ])
  return hashIntoScalar(string, curve)
}

function computeS(privateKey: BigNumber, r: BigNumber, e: BigNumber, curve: Curve): BigNumber {
  // sjcl mod() always returns a positive number.
  // There is no need add the curve order if it's negative.
  return r.sub(e.mul(privateKey)).mod(curve.order())
}

function computeR(signature: Signature, publicKey: SjclEllipticalPoint, curve: Curve): SjclEllipticalPoint {
  const scalars = [signature.s, signature.e]
  const points = [curve.G(), publicKey]

  return multiplyAndSumScalarsAndPoints(scalars, points)
}
