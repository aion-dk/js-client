import {BigNumber} from "../sjcl";
import {hexToScalar, scalarToHex} from "../utils";
import {Curve} from "../curve";

export class Signature {
  public e: BigNumber
  public s: BigNumber
  private curve: Curve

  constructor(e: BigNumber, s: BigNumber, curve: Curve) {
    this.e = e;
    this.s = s;
    this.curve = curve
  }

  public toString(): string {
    return [this.e, this.s].map( s => scalarToHex(s, this.curve) ).join(",")
  }
}

export function fromString(string: string, curve: Curve): Signature {
  if (!string.match(pattern(curve))) {
    throw new Error("input must match " + pattern(curve).source)
  }

  const strings = string.split(',');
  const e = hexToScalar(strings[0], curve);
  const s = hexToScalar(strings[1], curve);

  return new Signature(e, s, curve);
}

export function pattern(curve: Curve): RegExp {
  return new RegExp(
    "^(" +
    curve.scalarHexPrimitive().source +
    "," +
    curve.scalarHexPrimitive().source +
    ")$"
  );
}
