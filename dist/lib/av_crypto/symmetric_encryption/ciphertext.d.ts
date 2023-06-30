import { BitArray, SjclEllipticalPoint } from "../sjcl";
import { Curve } from "../curve";
export declare class Ciphertext {
    ciphertext: BitArray;
    tag: BitArray;
    iv: BitArray;
    ephemeralPublicKey: SjclEllipticalPoint;
    constructor(ciphertext: BitArray, tag: BitArray, iv: BitArray, ephemeralPublicKey: SjclEllipticalPoint);
    toString(): string;
}
export declare function fromString(string: string, curve: Curve): Ciphertext;
