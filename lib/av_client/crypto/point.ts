import * as crypto from "../aion_crypto";
import {Bignum} from "./bignum";
import type { BitArray, SjclEllipticalPoint } from "../sjcl";

export class Point {
  private eccPoint: SjclEllipticalPoint;

  constructor(point: SjclEllipticalPoint) {
    this.eccPoint = point;
  }

  equals = (other: Point) => !!crypto.pointEquals(this.eccPoint, other.eccPoint);

  mult = (k: Bignum): Point => new Point(this.eccPoint.mult(k.toBn()));

  toBits = (compressed: boolean): BitArray => crypto.pointToBits(this.eccPoint, compressed);
  toEccPoint = () => this.eccPoint;
}
