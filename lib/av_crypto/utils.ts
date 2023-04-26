import {BigNumber, SjclEllipticalPoint} from "./sjcl/sjcl";
import {Curve} from "./curve";
import sjcl = require("./sjcl/sjcl");

export function addPoints(point1: SjclEllipticalPoint, point2: SjclEllipticalPoint): SjclEllipticalPoint {
  return point1.toJac().add(point2).toAffine()
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

export function concatForHashing(parts: Array<string | number>): string {
  return parts.map( part => part.toString() ).join("-")
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
