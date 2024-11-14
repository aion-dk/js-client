import {Curve} from "../curve";
import {BigNumber, SjclECCPublicKey, SjclECCSecretKey, SjclKeyPair} from "../sjcl";
import * as sjcl from "sjcl-with-all";

export class Polynomial {
  public coefficients: Array<SjclKeyPair<SjclECCPublicKey, SjclECCSecretKey>>
  private curve: Curve

  constructor(coefficients: Array<SjclKeyPair<SjclECCPublicKey, SjclECCSecretKey>>, curve: Curve) {
    this.coefficients = coefficients;
    this.curve = curve
  }

  public evaluateAt(x: BigNumber): BigNumber {
    let result = new sjcl.bn(0);
    for (let i = 0; i < this.coefficients.length; i++) {
      const term =  this.coefficients[i].sec.S.mul(x.power(i)).mod(this.curve.order())
      result = result.add(term);
    }
    return result.mod(this.curve.order());
  }
}
