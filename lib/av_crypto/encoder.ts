import {SjclEllipticalPoint} from "./sjcl";
import {Curve} from "./curve";
import {hexToPoint, pointToHex} from "./utils";

const ADJUSTING_BYTE_COUNT = 1
const ENCODING_ITERATIONS = ADJUSTING_BYTE_COUNT * 256

export class Encoder {
  private curve: Curve
  public pointEncodingByteSize: number

  constructor(curve: Curve) {
    this.curve = curve
    this.pointEncodingByteSize = Math.floor(curve.degree() / 8.0) - ADJUSTING_BYTE_COUNT
  }

  public pointsToBytes(points: Array<SjclEllipticalPoint>): Array<number> {
    return points.flatMap( point => this.pointToBytes(point))
  }

  public bytesToPoints(bytes: Array<number>): Array<SjclEllipticalPoint> {
    if(bytes.some(b => b < 0 || b >= 256)) {
      throw new Error("input must be an array of bytes (between 0 and 255)")
    }

    const points: Array<SjclEllipticalPoint> = []

    for (let i = 0; i < bytes.length; i += this.pointEncodingByteSize) {
      const bytesSlice = bytes.slice(i, i + this.pointEncodingByteSize);
      const paddedBytesSlice = this.padBytes(bytesSlice);
      points.push(this.encodeIntoPoint(paddedBytesSlice))
    }

    return points
  }

  private padBytes(bytes: Array<number>): Array<number> {
    const paddingBytes = Array(this.pointEncodingByteSize - bytes.length).fill(0)

    return bytes.concat(paddingBytes)
  }

  private encodeIntoPoint(bytes: Array<number>): SjclEllipticalPoint {
    const bytesHex = bytes.map(b => this.byteToHex(b)).join('')

    for (let i = 0; i < ENCODING_ITERATIONS ; i++) {
      try {
        return this.generatePoint(bytesHex, i)
      } catch { continue; }
    }

    throw new Error("unable to encode bytes into a point on the curve")
  }

  private generatePoint(bytesHex: string, i: number): SjclEllipticalPoint {
    const adjustmentHex = this.byteToHex(i)
    // pad `00` to the left because of the secp521r1 curve
    const paddingHex = Array(this.curve.scalarHexSize() - adjustmentHex.length - bytesHex.length).fill("0").join('')
    const pointHex = "02" + paddingHex + adjustmentHex + bytesHex

    return hexToPoint(pointHex, this.curve)
  }

  private pointToBytes(point: SjclEllipticalPoint): Array<number> {
    if (point.isIdentity) {
      throw new Error("unable to decode infinity point")
    }

    const pointHex = pointToHex(point)
    const bytesHex = pointHex.slice(-this.pointEncodignHexSize())
    const bytes : Array<number> = [];
    for (let i = 0; i < bytesHex.length; i += 2) {
      bytes.push(parseInt(bytesHex.substring(i, i + 2), 16));
    }

    return bytes;
  }

  private byteToHex(byte: number): string {
    return byte.toString(16).padStart(2, '0')
  }

  private pointEncodignHexSize(): number {
    return this.pointEncodingByteSize * 2
  }
}
