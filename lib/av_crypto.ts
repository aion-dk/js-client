import {Curve} from "./av_crypto/curve";
import {Encoder} from "./av_crypto/encoder";
import {hexToPoint, generateKeyPair, scalarToHex, hexToScalar, pointToHex} from "./av_crypto/utils";
import * as elGamalScheme from "./av_crypto/el_gamal/scheme";
import {commit as pedersenCommit, isValid as isValidPedersen} from "./av_crypto/pedersen/scheme";
import {Commitment} from "./av_crypto/pedersen/commitment";
import * as elGamalCryptogram from "./av_crypto/el_gamal/cryptogram";

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
      const cryptogram = elGamalScheme.encrypt(point, encryptionKeyPoint, this.curve, randomness)

      cryptograms.push(cryptogram.toString())
      randomizers.push(scalarToHex(randomness.sec.S, this.curve))
    }

    return {
      cryptograms: cryptograms,
      randomizers: randomizers
    }
  }

  /**
   * Homomorphically combines two cryptograms.
   *
   * Used to combine the voter cryptogram with the empty cryptogram received form DBB.
   *
   * @param voterCryptogram The cryptogram of the voter
   * @param serverCryptogram The empty cryptogram from the DBB
   * @returns Returns the final cryptogram
   */
  public combineCryptograms(voterCryptogram: string, serverCryptogram: string): string {
    const c1 = elGamalCryptogram.fromString(voterCryptogram, this.curve)
    const c2 = elGamalCryptogram.fromString(serverCryptogram, this.curve)

    const c3 = elGamalScheme.homomorphicallyAdd([c1, c2])
    return c3.toString()
  }

  /**
   * Revert the encryption done by the randomizer.
   * Basically, it decrypts using the randomizer instead of the decryption key.
   *
   * This is used by the external verifier, when a ballot gets spoiled.
   *
   * @param cryptograms The cryptograms of the voter
   * @param randomizers The randomizers used in the encryption
   * @param encryptionKey The public encryption key used in the encryption
   * @returns Returns the decrypted bytes
   */
  public revertEncryption(cryptograms: Array<string>, randomizers: Array<string>, encryptionKey: string): Uint8Array {
    const pubKey = hexToPoint(encryptionKey, this.curve)

    const points = cryptograms.map((cryptogram, i) => {
      const c = elGamalCryptogram.fromString(cryptogram, this.curve)
      const r = hexToScalar(randomizers[i], this.curve)

      const c2 = new elGamalCryptogram.Cryptogram(pubKey, c.c)
      return elGamalScheme.decrypt(c2, r)
    })

    const bytes = new Encoder(this.curve).pointsToBytes(points)
    return new Uint8Array(bytes)
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
