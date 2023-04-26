import {Curve} from "./av_crypto/curve";

export const SUPPORTED_ELLIPTIC_CURVE_NAMES = {
  'secp256k1': 'k256',
  'secp256r1': 'c256',
  'secp384r1': 'c384',
  'secp521r1': 'c521'
};
export class AVCrypto {
  private curve: Curve;

  constructor(curveName: string) {
    if (!(curveName in SUPPORTED_ELLIPTIC_CURVE_NAMES)) {
      throw new Error("input must be one of the followings: " + Object.keys(SUPPORTED_ELLIPTIC_CURVE_NAMES).join(', '))
    }

    this.curve = new Curve(SUPPORTED_ELLIPTIC_CURVE_NAMES[curveName]);
  }
}
