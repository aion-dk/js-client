import {BigNumber, SjclEllipticalCurve, SjclEllipticalPoint, SjclHashStatic} from "./sjcl";
import * as sjcl from "sjcl-with-all";
import {Curve} from "./curve";
import {hexToPoint} from "./utils";

const ADJUSTING_BYTE_COUNT = 1
const ENCODING_ITERATIONS = ADJUSTING_BYTE_COUNT * 256

export class Encoder {
  private curve: Curve
  private pointEncodingByeSize: number

  constructor(curve: Curve) {
    this.curve = curve
    this.pointEncodingByeSize = Math.floor(curve.degree() / 8.0) - ADJUSTING_BYTE_COUNT
  }

  public bytesToPoints(bytes: Array<number>): Array<SjclEllipticalPoint> {
    if(bytes.some(b => b < 0 || b >= 256)) {
      throw new Error("input must be an array of bytes (between 0 and 255)")
    }

    const points: Array<SjclEllipticalPoint> = []

    for (let i = 0; i < bytes.length; i += this.pointEncodingByeSize) {
      const bytesSlice = bytes.slice(i, i + this.pointEncodingByeSize);
      const paddedBytesSlice = this.padBytes(bytesSlice);
      points.push(this.encodeIntoPoint(paddedBytesSlice))
    }

    return points
  }

  private padBytes(bytes: Array<number>): Array<number> {
    const paddingBytes = Array(this.pointEncodingByeSize - bytes.length).fill(0)

    return bytes.concat(paddingBytes)
  }

  private encodeIntoPoint(bytes: Array<number>): SjclEllipticalPoint {
    // FIXME: b.toString(16) produces "1" instead of "01"
    const bytesHex = bytes.map(b => b.toString(16)).join('')

    for (let i = 0; i < ENCODING_ITERATIONS ; i++) {
      try {
        return this.generatePoint(bytesHex, i)
      } catch { continue; }
    }

    throw new Error("unable to encode bytes into a point on the curve")
  }

  private generatePoint(bytesHex: string, i: number): SjclEllipticalPoint {
    // FIXME: i.toString(16) produces "1" instead of "01"
    const adjustmentHex = i.toString(16)
    // pad `00` to the left because of the secp521r1 curve
    const paddingHex = Array(this.curve.scalarHexSize() - adjustmentHex.length - bytesHex.length).fill("0").join('')
    const pointHex = "02" + paddingHex + adjustmentHex + bytesHex

    return hexToPoint(pointHex, this.curve)
  }
}
