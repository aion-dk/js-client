import { BigNumber } from "../sjcl";
import { Curve } from "../curve";
export declare class Signature {
    e: BigNumber;
    s: BigNumber;
    private curve;
    constructor(e: BigNumber, s: BigNumber, curve: Curve);
    toString(): string;
}
export declare function fromString(string: string, curve: Curve): Signature;
export declare function pattern(curve: Curve): RegExp;
