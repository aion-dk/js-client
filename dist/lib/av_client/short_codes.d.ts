/**
 * Converts from hex to base58.
 * The returned base58 string is padded to 7 chars.
 *
 * @param hex hex string of 10 chars
 * @returns a base58 string of 7 chars
 */
export declare function hexToShortCode(input: string): string;
/**
 * Converts from base58 to hex.
 * The returned hex string is padded to 10 chars.
 *
 * @param input base58 string of 7 chars
 * @returns hex string of 10 chars
 */
export declare function shortCodeToHex(input: string): string;
