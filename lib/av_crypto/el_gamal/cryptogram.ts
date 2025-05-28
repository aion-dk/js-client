import {SjclEllipticalPoint} from "../sjcl";
import {hexToPoint, pointToHex} from "../utils";
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

export function fromString(string: string, curve: Curve): Cryptogram {
  if (!string.match(pattern(curve))) {
    throw new Error("input must match " + pattern(curve).source)
  }

  const strings = string.split(',');
  const r = hexToPoint(strings[0], curve);
  const c = hexToPoint(strings[1], curve);

  return new Cryptogram(r, c);
}

export function pattern(curve: Curve): RegExp {
  return new RegExp(
    "^(" +
    curve.pointHexPrimitive().source +
    "," +
    curve.pointHexPrimitive().source +
    ")$"
  );
}
