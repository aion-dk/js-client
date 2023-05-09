import {BigNumber, SjclEllipticalPoint} from "../sjcl";

export class Commitment {
  public c: SjclEllipticalPoint
  public r?: BigNumber

  constructor(c: SjclEllipticalPoint, r?: BigNumber) {
    this.c = c;
    this.r = r;
  }

  public isOpenable(): boolean {
    return this.r !== undefined
  }
}
