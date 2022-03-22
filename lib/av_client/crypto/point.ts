import * as crypto from "../aion_crypto";
import {Bignum} from "./bignum";
import type { BitArray } from "./bitarray";

// As this is working with untyped SJCL classes,
// we need the _any_ type in this wrapper.

/*eslint-disable @typescript-eslint/no-explicit-any*/

export class Point {
  private eccPoint: any;

  constructor(point: any) {
    this.eccPoint = point;
  }

  equals = (other: Point) => !!crypto.pointEquals(this.eccPoint, other.eccPoint);

  mult = (k: Bignum): Point => new Point(this.eccPoint.mult(k.toBn()));

  toBits = (compressed: boolean): BitArray => crypto.pointToBits(this.eccPoint, compressed);
  toEccPoint = () => this.eccPoint;
}
