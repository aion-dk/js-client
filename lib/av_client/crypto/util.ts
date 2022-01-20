import * as crypto from "../aion_crypto";
const sjcl = require('../sjcl');

export const Curve = crypto.Curve;

export const addPoints = (a: Point, b: Point): Point => {
  return new Point(crypto.addPoints(a.toEccPoint(), b.toEccPoint()));
}

export const generateRandomBignum = () => new Bignum(crypto.randomBN());

export const hashToBignum = (hash: BitArray): Bignum => new Bignum(crypto.hashToBn(hash));


// Converter functions
// --------------------------
export const pointFromBits = (bits) => crypto.pointFromBits(bits);

export const pointFromHex = (hex: string): Point => new Point(pointFromBits(sjcl.codec.hex.toBits(hex)));
export const pointToHex = (point: Point): string => sjcl.codec.hex.fromBits(point.toBits(true));

export const bignumFromHex = (hex: string): Bignum => new Bignum(sjcl.bn.fromBits(sjcl.codec.hex.toBits(hex)));
export const bignumToHex = (bignum: Bignum): string => sjcl.codec.hex.fromBits(bignum.toBits());


// Other
// --------------------------
export const pointFromX = (x: Bignum): Point => {
  const flag = !x.isEven() ? 2 : 3;
  const flagBignum = new sjcl.bn(flag);

  const encodedPoint = sjcl.bitArray.concat(flagBignum.toBits(), x.toBits());

  return new Point(pointFromBits(encodedPoint));
}

// Types
// --------------------------
export class Bignum {
  private bn: any;

  constructor(data: any) {
    this.bn = new sjcl.bn(data);
  }

  isEven = () => this.bn.limbs[0] % 2 === 0;
  equals = (other: Bignum): boolean => !!this.bn.equals(other.bn);

  mod = (operand: Bignum): Bignum => new Bignum(this.bn.mod(operand.bn));
  add = (operand: Bignum): Bignum => new Bignum(this.bn.add(operand.bn))

  toBits = () => this.bn.toBits();
  toBn = () => this.bn;
}


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

type BitArray = {}
