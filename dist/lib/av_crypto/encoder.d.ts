import { SjclEllipticalPoint } from "./sjcl";
import { Curve } from "./curve";
export declare class Encoder {
    private curve;
    pointEncodingByteSize: number;
    constructor(curve: Curve);
    pointsToBytes(points: Array<SjclEllipticalPoint>): Array<number>;
    bytesToPoints(bytes: Array<number>): Array<SjclEllipticalPoint>;
    private padBytes;
    private encodeIntoPoint;
    private generatePoint;
    private pointToBytes;
    private byteToHex;
    private pointEncodignHexSize;
}
