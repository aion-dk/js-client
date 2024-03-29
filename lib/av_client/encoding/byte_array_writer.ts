export class ByteArrayWriter {
  private pointer: number
  private byteArray: Uint8Array

  /**
   * Constructs a ByteArrayWriter as a wrapper around a byte array of a given length
   * 
   * @param length the length of the internal byte array
   */
  constructor( length: number ){
    this.pointer = 0
    this.byteArray = new Uint8Array(length)
  }

  /**
   * Writes bytes to the internal Uint8Array and moves pointer.
   * 
   * @throws Error('Out of bounds') in the bytes does not fit the internal array
   * @param bytes bytes to write
   */
  write( bytes: Uint8Array ){
    if( this.pointer + bytes.length > this.byteArray.length ){
      throw new Error('Out of bounds')
    }
    this.byteArray.set(bytes, this.pointer)
    this.pointer += bytes.length
  }

  /**
   * Converts a positive integer to a byte array of a given length 
   * and writes it to the internal array.
   * 
   * @param length the length of the byte array
   * @param integer the integer to convert and write
   */
  writeInteger( length: number, integer: number, ){
    if( !Number.isInteger(integer) || integer < 0 ) throw new Error('Only non-negative integers supported')
    const slice = new Uint8Array(length)
    let remainder = integer
    let index = length - 1
    while( remainder > 0 && index >= 0 ){
      slice[index] = remainder % 256
      remainder = Math.floor(remainder / 256)
      index--
    }
    if( remainder !== 0 ) throw new Error('The provided integer requires more bytes')
    this.write(slice)
  }

  /**
   * Converts a utf8 string into a byte array of a given length
   * and writes it to the internal array.
   * 
   * @param length the length of the byte array
   * @param text the utf8 text to convert and write
   */
  writeString( length: number, text: string ){
    const slice = new Uint8Array(length)
    const textBytes = new TextEncoder().encode(text)
    slice.set(textBytes, 0)
    this.write(slice)
  }

  /**
   * Returns the internal byte array
   * 
   * @returns the internal byte array
   */
  getByteArray(): Uint8Array {
    return this.byteArray
  }
}
