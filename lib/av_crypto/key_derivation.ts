import {BitArray} from "./sjcl";
import * as sjcl from "sjcl-with-all";


export function pbkdf2(password: string, keyBitLength: number): BitArray {
  return sjcl.misc.pbkdf2(password, '', 10_000, keyBitLength)
}

export function hkdf(inputKey: BitArray, keyBitLength: number): BitArray {
  return sjcl.misc.hkdf(inputKey, keyBitLength, '', '', sjcl.hash.sha256)
}
