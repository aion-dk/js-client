import { Curve } from "./av_crypto/curve";
export declare const SUPPORTED_ELLIPTIC_CURVE_NAMES: {
    secp256k1: string;
    secp256r1: string;
    secp384r1: string;
    secp521r1: string;
};
export declare class AVCrypto {
    curve: Curve;
    constructor(curveName: string);
    /**
     * Encrypts a vote with the provided encryption key.
     *
     * @param vote The byte representation of the vote
     * @param encryptionKey The public encryption key
     * @returns Returns the cryptograms and their respective randomizers
     */
    encryptVote(vote: Uint8Array, encryptionKey: string): {
        cryptograms: Array<string>;
        randomizers: Array<string>;
    };
    /**
     * Homomorphically combines two cryptograms.
     *
     * Used to combine the voter cryptogram with the empty cryptogram received form DBB.
     *
     * @param voterCryptogram The cryptogram of the voter
     * @param serverCryptogram The empty cryptogram from the DBB
     * @returns Returns the final cryptogram
     */
    combineCryptograms(voterCryptogram: string, serverCryptogram: string): string;
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
    revertEncryption(cryptograms: Array<string>, randomizers: Array<string>, encryptionKey: string): Uint8Array;
    /**
     * Commit to a number of private hexadecimal cryptogram randomizes. This is used when
     * generating voter encryption commitments as well as the board encryption commitments.
     *
     * @param privateEncryptionRandomizers The collection of cryptogram randomizers
     * @param context The context of the commitment
     * @returns Returns the commitment and its randomizer as hexadecimal strings
     */
    commit(privateEncryptionRandomizers: Array<string>, context?: string): {
        commitment: string;
        privateCommitmentRandomizer: string;
    };
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
    isValidCommitment(commitment: string, privateCommitmentRandomizer: string, encryptionRandomizers: Array<string>, context?: string): boolean;
}
