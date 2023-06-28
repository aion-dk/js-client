import {Curve} from "./av_crypto/curve";
import {Encoder} from "./av_crypto/encoder";
import {hexToPoint, generateKeyPair, scalarToHex, hexToScalar, pointToHex} from "./av_crypto/utils";
import {encrypt as elGamalEncrypt} from "./av_crypto/el_gamal/scheme";
import {commit as pedersenCommit, isValid as isValidPedersen} from "./av_crypto/pedersen/scheme";
import {Commitment} from "./av_crypto/pedersen/commitment";

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

  /**
   * Commit to a number of private hexadecimal cryptogram randomizes. This is used when
   * generating voter encryption commitments as well as the board encryption commitments.
   *
   * @param privateEncryptionRandomizers The collection of cryptogram randomizers
   * @param context The context of the commitment
   * @returns Returns the commitment and its randomizer as hexadecimal strings
   */
  public commit(privateEncryptionRandomizers: Array<string>, context = ""): {commitment: string, privateCommitmentRandomizer: string } {
    const encryptionRandomizers = privateEncryptionRandomizers.map(s => {
      return hexToScalar(s, this.curve)
    });

    const commitment = pedersenCommit(encryptionRandomizers, context, this.curve)
    return {
      commitment: pointToHex(commitment.c),
      privateCommitmentRandomizer: scalarToHex(commitment.r!, this.curve)
    }
  }

  /**
   * Validate if a number of hexadecimal encryption randomizers, given the private
   * commitment randomizer, and the public commitment is a valid commitment.
   *
   * This is used when spoiling a vote.
   *
   * @param commitment The commitment
   * @param privateCommitmentRandomizer The randomizer of the commitment
   * @param encryptionRandomizers The hexadecimal encryption randomizers
   * @param context The context of the commitment
   * @returns Returns validation
   */
  public isValidCommitment(
    commitment: string,
    privateCommitmentRandomizer: string,
    encryptionRandomizers: Array<string>,
    context = ""
  ): boolean {
    const c = hexToPoint(commitment, this.curve)
    const r = hexToScalar(privateCommitmentRandomizer, this.curve)
    const pedersenCommitment = new Commitment(c, r)
    const messages = encryptionRandomizers.map(s => hexToScalar(s, this.curve))

    return isValidPedersen(pedersenCommitment, messages, context, this.curve)
  }
}
