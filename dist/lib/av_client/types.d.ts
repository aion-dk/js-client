/**
 * This is an index, with contest ids for keys, and arbitrary values that belong to matching contests.
 *
 * Example, with selected contest options:
 * ```javascript
 * { '1': 'option1', '2': 'optiona' }
 * ```
 *
 * Here `'1'` and `'2'` are contest ids, and `'option1'` and `'optiona'` are selected contest options.
 *
 * @template T Defines the data type of the value
 */
export interface ContestIndexed<T> {
    [contestId: string]: T;
}
export declare type KeyPair = {
    privateKey: string;
    publicKey: string;
};
export interface EmptyCryptogram {
    commitment: string;
    cryptogram: string;
}
export declare type EncryptedVote = {
    cryptogram: string;
    randomness: string;
    proof: string;
};
export declare type Affidavit = string;
