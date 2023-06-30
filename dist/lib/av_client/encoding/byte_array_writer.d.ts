export declare class ByteArrayWriter {
    private pointer;
    private byteArray;
    /**
     * Constructs a ByteArrayWriter as a wrapper around a byte array of a given length
     *
     * @param length the length of the internal byte array
     */
    constructor(length: number);
    /**
     * Writes bytes to the internal Uint8Array and moves pointer.
     *
     * @throws Error('Out of bounds') in the bytes does not fit the internal array
     * @param bytes bytes to write
     */
    write(bytes: Uint8Array): void;
    /**
     * Converts a positive integer to a byte array of a given length
     * and writes it to the internal array.
     *
     * @param length the length of the byte array
     * @param integer the integer to convert and write
     */
    writeInteger(length: number, integer: number): void;
    /**
     * Converts a utf8 string into a byte array of a given length
     * and writes it to the internal array.
     *
     * @param length the length of the byte array
     * @param text the utf8 text to convert and write
     */
    writeString(length: number, text: string): void;
    /**
     * Returns the internal byte array
     *
     * @returns the internal byte array
     */
    getByteArray(): Uint8Array;
}
