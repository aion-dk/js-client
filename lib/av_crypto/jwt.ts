import * as jwt from "jsonwebtoken"
import * as sjcl from "sjcl-with-all"
import {generateKeyPair} from "./utils";
import {Curve} from "./curve";
import {PrivateKeyInput} from "crypto";

const CURVE_NAME = "c256"
const ALGORITHM = "ES256"
const DEFAULT_EXPIRATION_OFFSET = 30 * 60
export function encode(payload: any): string {
  const keyPair = generateKeyPair(new Curve(CURVE_NAME))
  const privateKey = new Uint8Array(sjcl.codec.bytes.fromBits(keyPair.sec.S.toBits()))

  const a  = new PrivateKeyInput(privateKey)
  const a = jwt.sign(payload, privateKey, { algorithm: ALGORITHM })

  return "hello"
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function decode(token: string): Object {
  return { "a": "hello" }
}

export function isValid(token: string): boolean {
  return true
}
