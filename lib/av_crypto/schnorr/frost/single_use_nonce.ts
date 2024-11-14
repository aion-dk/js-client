import {BigNumber} from "../../sjcl";

export class SingleUseNonce {
  public d: BigNumber
  public e: BigNumber

  constructor(d: BigNumber, e: BigNumber) {
    this.d = d;
    this.e = e;
  }
}
