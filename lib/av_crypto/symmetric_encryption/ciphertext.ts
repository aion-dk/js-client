import {BitArray, SjclEllipticalPoint} from "../sjcl";
import {hexToPoint, pointToHex} from "../utils";
import {Curve} from "../curve";
import * as sjcl from "sjcl-with-all";
import {IV_BYTE_SIZE, TAG_BYTE_SIZE} from "./aes";

export class Ciphertext {
  public ciphertext: BitArray
  public tag: BitArray
  public iv: BitArray
  public ephemeralPublicKey: SjclEllipticalPoint

  constructor(ciphertext: BitArray, tag: BitArray, iv: BitArray, ephemeralPublicKey: SjclEllipticalPoint) {
    if (sjcl.bitArray.bitLength(tag) != TAG_BYTE_SIZE * 8) {
      throw new Error(`tag must be a ${TAG_BYTE_SIZE} bytes long BitArray`)
    }
    if (sjcl.bitArray.bitLength(iv) != IV_BYTE_SIZE * 8) {
      throw new Error(`iv must be a ${IV_BYTE_SIZE} bytes long BitArray`)
    }

    this.ciphertext = ciphertext;
    this.tag = tag;
    this.iv = iv;
    this.ephemeralPublicKey = ephemeralPublicKey;
  }

  public toString(): string {
    const json = {
      ciphertext: sjcl.codec.base64.fromBits(this.ciphertext),
      tag: sjcl.codec.base64.fromBits(this.tag),
      iv: sjcl.codec.base64.fromBits(this.iv),
      ephemeralPublicKey: pointToHex(this.ephemeralPublicKey)
    }

    return JSON.stringify(json)
  }
}

export function fromString(string: string, curve: Curve): Ciphertext {
  const json = JSON.parse(string)

  const ciphertext = sjcl.codec.base64.toBits(json.ciphertext)
  const tag = sjcl.codec.base64.toBits(json.tag)
  const iv = sjcl.codec.base64.toBits(json.iv)
  const ephemeralPublicKey = hexToPoint(json.ephemeralPublicKey, curve)

  return new Ciphertext(
    ciphertext,
    tag,
    iv,
    ephemeralPublicKey,
  )
}
