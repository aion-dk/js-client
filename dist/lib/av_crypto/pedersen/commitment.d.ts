import { BigNumber, SjclEllipticalPoint } from "../sjcl";
export declare class Commitment {
    c: SjclEllipticalPoint;
    r?: BigNumber;
    constructor(c: SjclEllipticalPoint, r?: BigNumber);
    isOpenable(): boolean;
}
