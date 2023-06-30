/**
 * @param {bytes} the bytes to be encoded as points.
 * @return {array of sjcl.ecc.point} An array of points representing encoding the bytes
 */
export declare const bytesToPoints: (bytes: Uint8Array) => any[];
/**
 * @param {points} the array of sjcl.ec.point to be decoded into bytes.
 * @param {byteCount} the amount of bytes to be returned. This is calculated as the largest size a vote could have.
 * @return {Uint8Array} The array of bytes
 */
export declare const pointsToBytes: (points: any[], byteCount: number) => Uint8Array;
