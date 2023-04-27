import {BigNumber, SjclEllipticalCurve, SjclEllipticalPoint, SjclHashStatic} from "./sjcl/sjcl";
import * as sjcl from "./sjcl/sjcl";

export class Curve {
  private _curve: SjclEllipticalCurve

  constructor(name: string) {
    this._curve = sjcl.ecc.curves[name]

    if (this._curve === undefined) {
      throw new Error("curve name is invalid")
    }
  }

  public curve(): SjclEllipticalCurve {
    return this._curve
  }

  public order(): BigNumber {
    return this._curve.r
  }

  public prime(): BigNumber {
    return this._curve.field.modulus
  }

  public a(): BigNumber {
    return this._curve.a
  }

  public b(): BigNumber {
    return this._curve.b
  }

  public G(): SjclEllipticalPoint {
    return this._curve.G
  }

  public sha(): SjclHashStatic {
    return sjcl.hash.sha256
  }

  public pointHexPattern(): RegExp {
    return new RegExp('^' + this.pointHexPrimitive().source + '$')
  }

  public scalarHexPattern(): RegExp {
    return new RegExp('^' + this.scalarHexPrimitive().source + '$')
  }

  public pointHexPrimitive(): RegExp {
    return new RegExp('((?:02|03)' + this.scalarHexPrimitive().source + '|00)')
  }

  public scalarHexPrimitive(): RegExp {
    return new RegExp('([a-f0-9]{' + this.scalarHexSize() + '})')
  }

  public scalarHexSize(): number {
    return this.scalarByteSize() * 2;
  }

  public scalarByteSize(): number {
    return this._curve.field.modulus.bitLength() / 8;
  }
}
