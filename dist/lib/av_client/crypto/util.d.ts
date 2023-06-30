import { Bignum } from "./bignum";
import { Point } from "./point";
import type { BitArray } from "./bitarray";
export declare const Curve: any;
export declare const pointFromBits: (bits: any) => any;
export declare const pointFromHex: (hex: string) => Point;
export declare const pointToHex: (point: Point) => string;
export declare const bignumFromHex: (hex: string) => Bignum;
export declare const bignumToHex: (bignum: Bignum) => string;
export declare const hashToBignum: (hash: BitArray) => Bignum;
export declare const generateRandomBignum: () => Bignum;
/**
 *
 * @param x x-value from with to derive y-value on the elliptic curve
 * @returns A valid point, if one exists for x. Otherwise null
 */
export declare const pointFromX: (x: Bignum) => Point | null;
export declare const addPoints: (a: Point, b: Point) => Point;
export declare const isValidHexString: (test: string) => boolean;
