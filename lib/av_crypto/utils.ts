import {BigNumber, SjclECCPublicKey, SjclECCSecretKey, SjclEllipticalPoint, SjclKeyPair} from "./sjcl";
import {Curve} from "./curve";
import * as sjcl from "sjcl-with-all";

export function addPoints(points: Array<SjclEllipticalPoint>): SjclEllipticalPoint {
  if (points.length == 0) {
    throw new Error("array must not be empty")
  }

  let sum = points[0].toJac()
  for (let i=1; i<points.length; i++) {
    sum = sum.add(points[i])
  }
  return sum.toAffine()
}

export function multiplyAndSumScalarsAndPoints(scalars: Array<BigNumber>, points: Array<SjclEllipticalPoint>): SjclEllipticalPoint {
  if (scalars.length != points.length) {
    throw new Error("scalars and points must have the same size")
  }

  let result = points[0].toJac().mult(scalars[0], points[0])
  for (let i=1; i<points.length; i++) {
    const term = points[i].mult(scalars[i])
    result = result.add(term)
  }
  return result.toAffine()
}

export function pointEquals(point1: SjclEllipticalPoint, point2: SjclEllipticalPoint): boolean {
  if (point1.isIdentity) {
    return point2.isIdentity
  }

  if (point2.isIdentity) {
    return false
  }

  return point1.x.equals(point2.x) && point1.y.equals(point2.y)
}

export function infinityPoint(curve: Curve): SjclEllipticalPoint {
  return new sjcl.ecc.point(curve.curve())
}

export function hashIntoScalar(string: string, curve: Curve): BigNumber {
  const sha = curve.sha()
  for (let i = 0; i < 10_000; i++) {
    const digest = sha.hash(concatForHashing([string, i]))
    const scalar = sjcl.bn.fromBits(digest)
    if (!scalar.greaterEquals(curve.order())) {
      return scalar
    }
  }

  throw new Error("unable to hash " + string + " into a scalar")
}

export function hashIntoPoint(string: string, curve: Curve): SjclEllipticalPoint {
  const sha = curve.sha()
  for (let i = 0; i < 10_000; i++) {
    let xHex = sjcl.codec.hex.fromBits(sha.hash(concatForHashing([string, i])))
    if (curve.curve() === sjcl.ecc.curves['c521']) {
      xHex = "0000" + xHex
    }
    try {
      return hexToPoint("02" + xHex, curve)
    } catch { continue; }
  }

  throw new Error("unable to hash " + string + " into a point on the curve")
}

export function pointToHex(point: SjclEllipticalPoint): string {
  let bits;
  if (point.isIdentity) {
    bits = sjcl.codec.bytes.toBits([0])
  } else {
    const flag = 2 | point.y.getLimb(0) & 1
    const flag_bits = sjcl.codec.bytes.toBits([flag])
    const data_bits = point.x.toBits()
    bits =  sjcl.bitArray.concat(flag_bits, data_bits)
  }

  return sjcl.codec.hex.fromBits(bits)
}

export function hexToPoint(string: string, curve: Curve): SjclEllipticalPoint {
  if (!string.match(curve.pointHexPattern())) {
    throw new Error("input must match " + curve.pointHexPattern().source)
  }

  const bits = sjcl.codec.hex.toBits(string)
  const flag = sjcl.bitArray.extract(bits, 0, 8)

  let p
  if (flag == 0) {
    p = new sjcl.ecc.point(curve.curve())
  } else {
    const x = sjcl.bn.fromBits(sjcl.bitArray.bitSlice(bits, 8))
    const y = recoverY(x, flag, curve)
    p = new sjcl.ecc.point(curve.curve(), x, y)

    if (!p.isValid()) {
      throw new Error("not on the curve!")
    }
  }

  return p
}

export function scalarToHex(scalar: BigNumber, curve: Curve): string {
  return sjcl.codec.hex.fromBits(scalar.toBits()).padStart(curve.scalarHexSize(), '0')
}

export function hexToScalar(string: string, curve: Curve): BigNumber {
  if (!string.match(curve.scalarHexPattern())) {
    throw new Error("input must match " + curve.scalarHexPattern().source)
  }

  const scalar = sjcl.bn.fromBits(sjcl.codec.hex.toBits(string))

  if (scalar.greaterEquals(curve.order())) {
    throw new Error("scalar must be lower than the curve order")
  }

  return scalar
}

export function concatForHashing(parts: Array<string | number>): string {
  return parts.map( part => part.toString() ).join("-")
}

export function generateKeyPair(
  curve: Curve,
  privateKey?: BigNumber
): SjclKeyPair<SjclECCPublicKey, SjclECCSecretKey> {
  if(privateKey !== undefined && privateKey.greaterEquals(curve.order())) {
    throw new Error("privateKey must be lower than the curve order")
  }

  const keyPair = sjcl.ecc.elGamal.generateKeys(curve.curve(), undefined, privateKey)
  return keyPair
}

function recoverY(x: BigNumber, flag: number, curve: Curve): BigNumber {
  const ySquared = curve.b()
    .add(x.mulmod(
        curve.a().add(x.square().mod(curve.prime())).mod(curve.prime()),
        curve.prime()))
    .mod(curve.prime())

  const p = curve.prime().add(1)
  p.halveM()
  p.halveM()

  let y = ySquared.powermod(p, curve.prime())
  if ((2 | y.getLimb(0) & 1) !== flag) {
    y = curve.prime().sub(y).normalize()
  }

  return y;
}
