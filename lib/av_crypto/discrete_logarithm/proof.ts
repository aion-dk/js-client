import {BigNumber, SjclEllipticalPoint} from "../sjcl";
import {hexToPoint, hexToScalar, pointToHex, scalarToHex} from "../utils";
import {Curve} from "../curve";

export class Proof {
  public k: SjclEllipticalPoint
  public r: BigNumber
  private curve: Curve

  constructor(k: SjclEllipticalPoint, r: BigNumber, curve: Curve) {
    this.k = k;
    this.r = r;
    this.curve = curve
  }

  public toString(): string {
    return [
      pointToHex(this.k),
      scalarToHex(this.r, this.curve)
    ].join(",")
  }
}

export function fromString(string: string, curve: Curve) {
  if (!string.match(pattern(curve))) {
    throw new Error("input must match " + pattern(curve).source)
  }

  const strings = string.split(',');
  const k = hexToPoint(strings[0], curve);
  const r = hexToScalar(strings[1], curve);

  return new Proof(k, r, curve);
}

export function pattern(curve: Curve): RegExp {
  return new RegExp(
    "^(" +
    curve.pointHexPrimitive().source +
    "," +
    curve.scalarHexPrimitive().source +
    ")$"
  );
}
