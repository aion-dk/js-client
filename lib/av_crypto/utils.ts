import {BigNumber} from "./sjcl/sjcl";
import {Curve} from "./curve";
import sjcl = require("./sjcl/sjcl");

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

function concatForHashing(parts: Array<string | number>): string {
  return parts.map( part => part.toString() ).join("-")
}
