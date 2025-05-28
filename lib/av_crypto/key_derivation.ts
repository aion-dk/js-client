import {BitArray} from "./sjcl";
import * as sjcl from "sjcl-with-all";
import { hkdf as noble_hkdf } from '@noble/hashes/hkdf';
import { sha256 } from '@noble/hashes/sha256';

export function pbkdf2(password: string, keyByteLength: number): BitArray {
  return sjcl.misc.pbkdf2(password, '', 10_000, keyByteLength * 8)
}

export function hkdf(inputKey: BitArray, keyByteLength: number): BitArray {
  const key = noble_hkdf(
    sha256,
    new Uint8Array(sjcl.codec.bytes.fromBits(inputKey)),
    '',
    '',
    keyByteLength
  );

  return sjcl.codec.bytes.toBits(key)
}
