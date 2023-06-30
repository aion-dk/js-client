import { BigNumber, SjclEllipticalPoint } from "../sjcl";
import { Curve } from "../curve";
export declare class Proof {
    k: SjclEllipticalPoint;
    r: BigNumber;
    private curve;
    constructor(k: SjclEllipticalPoint, r: BigNumber, curve: Curve);
    toString(): string;
}
export declare function fromString(string: string, curve: Curve): Proof;
export declare function pattern(curve: Curve): RegExp;
