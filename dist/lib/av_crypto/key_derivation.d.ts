import { BitArray } from "./sjcl";
export declare function pbkdf2(password: string, keyByteLength: number): BitArray;
export declare function hkdf(inputKey: BitArray, keyByteLength: number): BitArray;
