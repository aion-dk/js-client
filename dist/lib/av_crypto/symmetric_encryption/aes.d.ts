import { BitArray } from "../sjcl";
export declare const KEY_BYTE_SIZE = 32;
export declare const TAG_BYTE_SIZE = 16;
export declare const IV_BYTE_SIZE = 12;
export declare function encrypt(symmetricKey: BitArray, message: string, iv?: BitArray): [BitArray, BitArray, BitArray];
export declare function decrypt(symmetricKey: any, ciphertext: any, tag: any, iv: any): any;
