import { Bignum } from "./bignum";
import type { BitArray, SjclEllipticalPoint } from "../sjcl";
export declare class Point {
    private eccPoint;
    constructor(point: SjclEllipticalPoint);
    equals: (other: Point) => boolean;
    mult: (k: Bignum) => Point;
    toBits: (compressed: boolean) => BitArray;
    toEccPoint: () => SjclEllipticalPoint;
}
