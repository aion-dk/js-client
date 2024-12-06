import {Curve} from "./av_crypto/curve";
import {Encoder} from "./av_crypto/encoder";
import {hexToPoint, generateKeyPair, scalarToHex, hexToScalar, pointToHex} from "./av_crypto/utils";
import {commit as pedersenCommit, isValid as isValidPedersen} from "./av_crypto/pedersen/scheme";
import {Commitment} from "./av_crypto/pedersen/commitment";
import * as elGamalCryptogram from "./av_crypto/el_gamal/cryptogram";
import * as elGamalScheme from "./av_crypto/el_gamal/scheme";
import * as discreteLogarithmScheme from "./av_crypto/discrete_logarithm/scheme"
import * as Signature from "./av_crypto/schnorr/signature"
import * as signatureScheme from "./av_crypto/schnorr/scheme"
import * as symmetricEncryptionScheme from "./av_crypto/symmetric_encryption/scheme"
import * as sjcl from "sjcl-with-all";
import * as aesCiphertext from "./av_crypto/symmetric_encryption/ciphertext";
import {pbkdf2} from "./av_crypto/key_derivation";

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
   * Generates a private public hexadecimal key pair.
   *
   * @returns Returns a private key and the corresponding public key.
   */
  public generateKeyPair(): { privateKey: string, publicKey: string } {
    const keyPair = generateKeyPair(this.curve);

    return {
      privateKey: scalarToHex(keyPair.sec.S, this.curve),
      publicKey: pointToHex(keyPair.pub.H)
    }
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
   * Converts a vote into a cryptogram format, which is not encrypted.
   * This should be used when the vote secrecy is disabled.
   * The returned `randomizers` are all zeros.
   *
   * To secretly encrypt a vote use `.encryptVote()` instead.
   *
   * @param vote The byte representation of the vote
   * @param encryptionKey The public encryption key
   * @returns Returns the cryptograms and their respective randomizers
   */
  public encryptTransparentVote(vote: Uint8Array, encryptionKey: string): { cryptograms: Array<string>, randomizers: Array<string> } {
    const points = new Encoder(this.curve).bytesToPoints(Array.from(vote))
    const encryptionKeyPoint = hexToPoint(encryptionKey, this.curve)

    const cryptograms: Array<string> = []
    const randomizers: Array<string> = []

    const zero = new sjcl.bn(0)
    const randomness = generateKeyPair(this.curve, zero)
    const zeroHex = scalarToHex(zero, this.curve)

    for (const point of points) {
      const cryptogram = elGamalScheme.encrypt(point, encryptionKeyPoint, this.curve, randomness)

      cryptograms.push(cryptogram.toString())
      randomizers.push(zeroHex)
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
   * Generates the proof of correct encryption.
   *
   * Used to prove that the empty cryptograms were used in the process of ballot encryption.
   * This generates one proof for one cryptogram. This should be called for each cryptogram
   * of the encrypted ballot.
   *
   * @param randomizer The encryption randomizer generated by the voter.
   * @returns Returns the proof string.
   */
  public generateProofOfCorrectEncryption(randomizer: string): string {
    const r = hexToScalar(randomizer, this.curve);
    const context = "";
    const proof = discreteLogarithmScheme.prove(r, context, this.curve)

    return proof.toString()
  }

  /**
   * Revert the encryption done by the randomizer.
   * Basically, it decrypts using the randomizer instead of the decryption key.
   *
   * This is used by the external verifier, when a ballot gets spoiled.
   *
   * @param cryptograms The cryptograms of the voter
   * @param boardRandomizers The randomizers used by the DBB in the encryption
   * @param voterRandomizers The randomizers used by the voter in the encryption
   * @param encryptionKey The public encryption key used in the encryption
   * @returns Returns the decrypted bytes
   */
  public revertEncryption(cryptograms: Array<string>, boardRandomizers: Array<string>, voterRandomizers: Array<string>, encryptionKey: string): Uint8Array {
    const pubKey = hexToPoint(encryptionKey, this.curve)

    const points = cryptograms.map((cryptogram, i) => {
      const c = elGamalCryptogram.fromString(cryptogram, this.curve)
      const br = hexToScalar(boardRandomizers[i], this.curve)
      const vr = hexToScalar(voterRandomizers[i], this.curve)
      const r = br.add(vr).mod(this.curve.order())

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

  /**
   * Encrypts any arbitrary length string using symmetric AES encryption.
   * The symmetric encryption key is generated using a Diffie Hellman based hkdf algorithm,
   * combining the `encryptionKey` with a randomly generated ephemeral key pair.
   *
   * @param text The string to be encrypted
   * @param encryptionKey The public key used to derive the symmetric encryption key
   * @returns Returns the encrypted ciphertext
   */
  public encryptText(text: string, encryptionKey: string): string {
    const encryptionKeyPoint = hexToPoint(encryptionKey, this.curve)

    const ciphertext = symmetricEncryptionScheme.encrypt(text, encryptionKeyPoint, this.curve)
    return ciphertext.toString()
  }

  /**
   * Decrypts a string using symmetric AES decryption.
   * The symmetric encryption key is generated using a Diffie Hellman based hkdf algorithm,
   * combining the `decryptionKey` with the ephemeral key pair included in the ciphertext.
   *
   * @param ciphertext The string to be decrypted
   * @param decryptionKey The private key used to derive the symmetric encryption key
   * @returns Returns the decrypted plain text
   */
  public decryptText(ciphertext: string, decryptionKey: string): string {
    const parsedCiphertext = aesCiphertext.fromString(ciphertext, this.curve)
    const decryptionKeyScalar = hexToScalar(decryptionKey, this.curve)

    return symmetricEncryptionScheme.decrypt(
      parsedCiphertext,
      decryptionKeyScalar,
      this.curve
    )
  }

  /**
   * Generate a hexadecimal keypair based on a number of string election codes.
   * Generate a hexadecimal discrete logarithm proof of knowledge of the private key.
   *
   * @param electionCodes The list of election codes
   * @returns Returns the private-public key pair and the proof as hexadecimal strings
   */
  public generateProofOfElectionCodes(electionCodes: Array<string>): { privateKey: string, publicKey: string, proof: string } {
    const byteLength = Math.floor(this.curve.degree() / 8.0)

    const sum = new sjcl.bn(0)
    electionCodes
      .map(electionCode => pbkdf2(electionCode, byteLength))
      .map(bitArray => sjcl.bn.fromBits(bitArray))
      .forEach(term => sum.addM(term))

    const keyPair = generateKeyPair(this.curve, sum.mod(this.curve.order()));
    const proof = discreteLogarithmScheme.prove(keyPair.sec.S, "", this.curve)

    return {
      privateKey: scalarToHex(keyPair.sec.S, this.curve),
      publicKey: pointToHex(keyPair.pub.H),
      proof: proof.toString()
    }
  }

  /**
   * Generates a hexadecimal Schnorr signature on a particular message.
   *
   * @param message The message to be signed.
   * @param signingKey The signing key as a hexadecimal string
   * @return {string} The signature as a string
   */
  public sign(message: string, signingKey: string): string {
    const signingKeyScalar = hexToScalar(signingKey, this.curve)
    const signature = signatureScheme.sign(message, signingKeyScalar, this.curve)

    return signature.toString()
  }

  /**
   * Verifies a Schnorr signature on a particular message
   *
   * @param signature The signature as a string.
   * @param message The message to be signed.
   * @param signingPublicKey The signature verification key as a string
   * @return {boolean}
   */
  public isValidSignature(signature: string, message: string, signingPublicKey: string): boolean {
    const signatureInstance = Signature.fromString(signature, this.curve)
    const signingPublicKeyPoint = hexToPoint(signingPublicKey, this.curve)

    return signatureScheme.isValid(signatureInstance, message, signingPublicKeyPoint, this.curve)
  }
}
