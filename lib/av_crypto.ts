import {Curve} from "./av_crypto/curve";
import {Encoder} from "./av_crypto/encoder";
import {hexToPoint, generateKeyPair, scalarToHex, hexToScalar} from "./av_crypto/utils";
import {encrypt as elGamalEncrypt} from "./av_crypto/el_gamal/scheme";

export const SUPPORTED_ELLIPTIC_CURVE_NAMES = {
  'secp256k1': 'k256',
  'secp256r1': 'c256',
  'secp384r1': 'c384',
  'secp521r1': 'c521'
};
export class AVCrypto {
  curve: Curve;

  constructor(curveName: string) {
    if (!(curveName in SUPPORTED_ELLIPTIC_CURVE_NAMES)) {
      throw new Error("input must be one of the followings: " + Object.keys(SUPPORTED_ELLIPTIC_CURVE_NAMES).join(', '))
    }

    this.curve = new Curve(SUPPORTED_ELLIPTIC_CURVE_NAMES[curveName]);
  }

  /**
   * Encrypts a vote with the provided encryption key.
   *
   * @param vote The byte representation of the vote
   * @param encryptionKey The public encryption key
   * @returns Returns the cryptograms and their respective randomizers
   */
  public encryptVote(vote: Uint8Array, encryptionKey: string): { cryptograms: Array<string>, randomizers: Array<string> } {
    const points = new Encoder(this.curve).bytesToPoints(Array.from(vote))
    const encryptionKeyPoint = hexToPoint(encryptionKey, this.curve)

    const cryptograms: Array<string> = []
    const randomizers: Array<string> = []

    for (const point of points) {
      const randomness = generateKeyPair(this.curve)
      const cryptogram = elGamalEncrypt(point, encryptionKeyPoint, this.curve, randomness)

      cryptograms.push(cryptogram.toString())
      randomizers.push(scalarToHex(randomness.sec.S, this.curve))
    }

    return {
      cryptograms: cryptograms,
      randomizers: randomizers
    }
  }
}
