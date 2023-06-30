/**
 * Encrypt an arbitrary amount of (string) data symmetrically.
 * @param {string} encryptionKeyHex The public key of the External Verifier.
 * @param {string} message The plaintext to be encrypted.
 * @return {DHPackage} A package object with the ciphertext, the tag, the iv, and the ephemeral public key.
 */
export declare function dhEncrypt(encryptionKeyHex: string, message: string): DHPackage;
/**
 * Decrypts an arbitrary amount of (string) data symmetrically.
 * @param {string} decryptionKeyHex The decryption key.
 * @param {DHPackage} dhPackage The package as returned by the dhEncrypt.
 * @return {string} The plaintext.
 */
export declare function dhDecrypt(decryptionKeyHex: string, dhPackage: DHPackage): string;
export declare class DHPackage {
    ciphertext: any;
    tag: any;
    iv: any;
    ephemeralPublicKey: any;
    constructor(ciphertext: any, tag: any, iv: any, ephemeralPublicKey: any);
    toString(): string;
    static fromString(json: string): DHPackage;
}
