import {BigNumber, SjclEllipticalPoint} from "../../sjcl";
import {Curve} from "../../curve";
import {concatForHashing, pointToHex, scalarToHex} from "../../utils";

export class CommitmentShare {
  public i: BigNumber
  public d: SjclEllipticalPoint
  public e: SjclEllipticalPoint
  private curve: Curve

  constructor(i: BigNumber, d: SjclEllipticalPoint, e: SjclEllipticalPoint, curve: Curve) {
    this.i = i;
    this.d = d;
    this.e = e;
    this.curve = curve
  }

  public toString(): string {
    return concatForHashing([
      scalarToHex(this.i, this.curve),
      pointToHex(this.d),
      pointToHex(this.e)
    ])
  }
}
