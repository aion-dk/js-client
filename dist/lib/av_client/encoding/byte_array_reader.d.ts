export declare class ByteArrayReader {
    private pointer;
    private byteArray;
    /**
     * constructs a ByteArrayReader as a wrapper around the given byte array
     *
     * @param byteArray the wrapped byte array
     */
    constructor(byteArray: Uint8Array);
    /**
     * Reads an amount of bytes from the position of the pointer.
     * The requested bytes will be returned as a Uint8Array.
     *
     * @throws Error('Out of bounds') in there are not enough bytes left to read
     * @param length amount of bytes to read
     * @returns array of bytes
     */
    read(length: number): Uint8Array;
    /**
     * Reads the remainder of the array to check if we have any more bytes
     * that are not null.
     *
     * @returns true if there are more bytes to read, false otherwise
     */
    hasMore(): boolean;
    /**
     * Reads an amount of bytes and converts to a positive integer
     *
     * @param size amount of bytes to read and interpret to number
     * @returns number
     */
    readInteger(size: number): number;
    /**
     * Reads an amount of bytes and converts to a (utf8) string.
     * Any zero bytes by the end of the string is considered padding
     * and are discarded before the string is returned.
     *
     * @param size amount of bytes to read and interpret as string
     * @returns string
     */
    readString(size: number): string;
}
