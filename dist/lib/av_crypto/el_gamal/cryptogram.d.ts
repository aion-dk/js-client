import { SjclEllipticalPoint } from "../sjcl";
import { Curve } from "../curve";
export declare class Cryptogram {
    r: SjclEllipticalPoint;
    c: SjclEllipticalPoint;
    constructor(r: SjclEllipticalPoint, c: SjclEllipticalPoint);
    toString(): string;
}
export declare function fromString(string: string, curve: Curve): Cryptogram;
export declare function pattern(curve: Curve): RegExp;
