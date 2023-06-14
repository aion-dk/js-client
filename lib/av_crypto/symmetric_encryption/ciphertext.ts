import {BitArray, SjclEllipticalPoint} from "../sjcl";
import {hexToPoint, pointToHex} from "../utils";
import {Curve} from "../curve";
import * as sjcl from "sjcl-with-all";

export class Ciphertext {
  public ciphertext: BitArray
  public tag: BitArray
  public iv: BitArray
  public ephemeralPublicKey: SjclEllipticalPoint

  constructor(ciphertext: BitArray, tag: BitArray, iv: BitArray, ephemeralPublicKey: SjclEllipticalPoint) {
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
