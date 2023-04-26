import {BigNumber, SjclEllipticalCurve, SjclHashStatic} from "./sjcl/sjcl";
import * as sjcl from "./sjcl/sjcl";

export class Curve {
  private _curve: SjclEllipticalCurve

  constructor(name: string) {
    this._curve = sjcl.ecc.curves[name]
  }

  public curve(): SjclEllipticalCurve {
    return this._curve
  }

  public order(): BigNumber {
    return this._curve.r
  }

  public sha(): SjclHashStatic {
    return sjcl.hash.sha256
  }

  public pointHexPrimitive(): RegExp {
    return new RegExp('(?:02|03)' + this.scalarHexPrimitive() + '|00')
  }

  public scalarHexPrimitive(): RegExp {
    return new RegExp('[a-f0-9]{' + this.scalarHexSize() + '}')
  }

  public scalarHexSize(): number {
    return this.scalarByteSize() * 2;
  }

  public scalarByteSize(): number {
    return this._curve.field.modulus.bitLength() / 8;
  }
}
