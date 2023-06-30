import { BigNumber, SjclEllipticalCurve, SjclEllipticalPoint, SjclHashStatic } from "./sjcl";
export declare class Curve {
    private _curve;
    constructor(name: string);
    curve(): SjclEllipticalCurve;
    order(): BigNumber;
    prime(): BigNumber;
    degree(): number;
    a(): BigNumber;
    b(): BigNumber;
    G(): SjclEllipticalPoint;
    sha(): SjclHashStatic;
    pointHexPattern(): RegExp;
    scalarHexPattern(): RegExp;
    pointHexPrimitive(): RegExp;
    scalarHexPrimitive(): RegExp;
    scalarHexSize(): number;
    private scalarByteSize;
}
