import { ElectionConfig } from "./election_config";

export interface IAVClient {
  initialize(electionConfig: ElectionConfig): Promise<void>
  initialize(): Promise<void>
  requestAccessCode(opaqueVoterId: string, email: string): Promise<void>
  validateAccessCode(code: string): Promise<void>
  registerVoter(): Promise<void>
  constructBallotCryptograms(cvr: CastVoteRecord): Promise<string>
  spoilBallotCryptograms(): Promise<void>
  submitBallotCryptograms(affidavit: Affidavit): Promise<BallotBoxReceipt>
  purgeData(): void
}

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

 /**
 * Example of a receipt:
 * ```javascript
 * {
 *    previousBoardHash: 'd8d9742271592d1b212bbd4cbbbe357aef8e00cdbdf312df95e9cf9a1a921465',
 *    boardHash: '5a9175c2b3617298d78be7d0244a68f34bc8b2a37061bb4d3fdf97edc1424098',
 *    registeredAt: '2020-03-01T10:00:00.000+01:00',
 *    serverSignature: 'dbcce518142b8740a5c911f727f3c02829211a8ddfccabeb89297877e4198bc1,46826ddfccaac9ca105e39c8a2d015098479624c411b4783ca1a3600daf4e8fa',
 *    voteSubmissionId: 6
 * }
 * ```
 */
 export type BallotBoxReceipt = {
  previousBoardHash: HashValue
  boardHash: HashValue
  registeredAt: string
  serverSignature: Signature
  voteSubmissionId: string
}

export type Signature = string;
export type HashValue = string;
