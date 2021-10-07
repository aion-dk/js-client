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
export interface ContestMap<T> {
  [contestId: string]: T;
}

export type KeyPair = {
  privateKey: string;
  publicKey: string;
}

export interface EmptyCryptogram {
  commitment_point: string;
  empty_cryptogram: string;
}

/**
 * A Base64-encoded string containing the affidavit
 */
export type Affidavit = string

export interface OpenableEnvelope {
  cryptogram: string
  randomness: string
}

export interface SealedEnvelope {
  cryptogram: string
  proof: string
}

export interface Ballot {
  id: number;
  vote_encoding_type: number;
  title: LocalString;
  description: LocalString;
  options: Option[];
  write_in: boolean;
  //...
}

export interface Option {
  id: number;
  handle: string;
  title: LocalString;
  subtitle: LocalString;
  description: LocalString;
}

export interface LocalString {
  [locale: string]: string;
}

export interface Election {
  enabled: boolean;
  id: number;
  title: LocalString;
  subtitle: LocalString;
  description: LocalString;
  //...
}

/**
 * A structure that contains the choice(s) of a voter.
 *
 * Key is an electionId.
 * Value is the chosen option represented by a handle-string
 *
 * Example of a CastVoteRecord:
 * ```javascript
 * {
 *    '1': 'option1',
 *    '2': 'optionA'
 * }
 * ```
 */
 export type CastVoteRecord = ContestMap<string>
