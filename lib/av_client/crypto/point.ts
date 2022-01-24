import * as crypto from "../aion_crypto";
import Bignum from "./bignum";
import type { BitArray } from "./bitarray";

export default class Point {
  private eccPoint: any;

  constructor(point: any) {
    this.eccPoint = point;
  }

  equals = (other: Point) => !!crypto.pointEquals(this.eccPoint, other.eccPoint);

  mult = (k: Bignum): Point => new Point(this.eccPoint.mult(k.toBn()));

  toBits = (compressed: boolean): BitArray => crypto.pointToBits(this.eccPoint, compressed);
  toEccPoint = () => this.eccPoint;
}
