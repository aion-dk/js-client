import * as base from 'base-x'
import { InvalidTrackingCodeError } from './errors'
import * as sjcl from './sjcl'

const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const bs58 = base(BASE58)

const BASE58_PAD = BASE58[0]
const HEX_PAD = '0'

/**
 * Converts from hex to base58. 
 * The returned base58 string is padded to 7 chars.
 * 
 * @param hex hex string of 10 chars
 * @returns a base58 string of 7 chars
 */
export function hexToShortCode(input: string): string {
  if( ! input.match(/^[0-9a-f]*$/i) ){
    throw new Error('Non-hex character')
  }
  const bits = sjcl.codec.hex.toBits(input)
  const bytes = sjcl.codec.bytes.fromBits(bits)
  const byteArray = leftTrim(Uint8Array.from(bytes))

  if( byteArray.length > 5 ){
    throw new InvalidTrackingCodeError("Invalid input. Only up to 40 bits are supported.")
  }

  const encoded = bs58.encode(byteArray)
  return encoded.padStart(7, BASE58_PAD)
}

/**
 * Converts from base58 to hex. 
 * The returned hex string is padded to 10 chars.
 * 
 * @param input base58 string of 7 chars
 * @returns hex string of 10 chars
 */
export function shortCodeToHex(input: string): string {
  const byteArray = leftTrim(bs58.decode(input))
  if( byteArray.length > 5 ){
    throw new InvalidTrackingCodeError("Invalid input. Only up to 40 bits are supported.")
  }

  const bits = sjcl.codec.bytes.toBits(Array.from(byteArray))
  const hex = sjcl.codec.hex.fromBits(bits)

  return hex.padStart(10, HEX_PAD)
}

function leftTrim(byteArray: Uint8Array): Uint8Array {
  let i = 0
  while( byteArray[i] === 0 ) i++ // increase i until a non-zero is found
  return i === 0 ? byteArray : byteArray.slice(i)
}
