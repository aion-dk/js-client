import {SjclEllipticalPoint} from "../sjcl/sjcl";
import {pointToHex} from "../utils";
import {Curve} from "../curve";

export class Cryptogram {
  public r: SjclEllipticalPoint
  public c: SjclEllipticalPoint

  constructor(r: SjclEllipticalPoint, c: SjclEllipticalPoint) {
    this.r = r;
    this.c = c;
  }

  public toString(): string {
    return [this.r, this.c].map( p => pointToHex(p) ).join(",")
  }
}

export function pattern(curve: Curve): RegExp {
  return new RegExp(curve.pointHexPrimitive() + "," + curve.pointHexPrimitive());
}
