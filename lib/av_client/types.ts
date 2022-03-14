import { ElectionConfig } from "./election_config";

export interface IAVClient {
  initialize(electionConfig: ElectionConfig): Promise<void>
  initialize(): Promise<void>
  requestAccessCode(opaqueVoterId: string, email: string): Promise<void>
  validateAccessCode(code: string): Promise<void>
  registerVoter(): Promise<void>
  constructBallot(cvr: CastVoteRecord): Promise<string>
  waitForVerifierRegistration(): Promise<string>
  spoilBallot(): Promise<string>
  castBallot (affidavit: Affidavit): Promise<BallotBoxReceipt>
  purgeData(): void
  challengeBallot(): void
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
  cryptograms: string[]
  randomness: string[]
}

export interface SealedEnvelope {
  cryptograms: string[]
  proofs: string[]
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
  reference: string;
  code: number;
  children?: Option[];
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
 * Value is the chosen option represented by a reference-string
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
  address: string
  registeredAt: string
  signature: Signature
}

export type BoardItem =
  VoterSessionItem |
  VoterCommitmentItem |
  BoardCommitmentItem |
  BallotCryptogramItem

export type BoardItemType =
  "BallotCryptogramsItem" |
  "BoardEncryptionCommitmentItem" |
  "CastRequestItem" |
  "SpoilRequestItem" |
  "VerificationStartItem" |
  "VerifierItem" |
  "VoterEncryptionCommitmentItem" |
  "VoterSessionItem" |
  "VoterEncryptionCommitmentOpeningItem"

interface BaseBoardItem {
  address: string
  author: string
  parentAddress: string
  previousAddress: string
  registeredAt: string
  signature: string
}

export interface BaseVerificationItem extends BaseBoardItem{
  shortAddress: string
}

export interface VoterSessionItem extends BaseBoardItem {
  content: {
    authToken: string
    identifier: string
    voterGroup: string
    publicKey: string
  }

  type: "VoterSessionItem"
  // Segments...
}

export interface BoardCommitmentItem extends BaseBoardItem {
  content: {
    commitment: string
  } 

  type: "BoardEncryptionCommitmentItem"
}

export interface VoterCommitmentOpeningItem extends BaseVerificationItem {
  content: CommitmentOpening
  type: "VoterEncryptionCommitmentOpeningItem"
}

export interface BoardCommitmentOpeningItem extends BaseVerificationItem {
  content: CommitmentOpening
  type: "BoardEncryptionCommitmentOpeningItem"
}

export interface VoterCommitmentItem extends BaseBoardItem {
  content: {
    commitment: string
  } 

  type: "VoterEncryptionCommitmentItem"
}

export interface BallotCryptogramItem extends BaseBoardItem {
  content: {
    cryptograms: ContestMap<string[]>
  } 
  type: "BallotCryptogramsItem"
}

export interface VerificationStartItem extends BaseVerificationItem {
  type: "VerificationStartItem"
}

export interface VerifierItem extends BaseVerificationItem {
  content: {
    publicKey: string
  }
  type: "VerifierItem"
}

export interface SpoilRequestItem extends BaseBoardItem {
  type: "SpoilRequestItem"
}

export interface CommitmentOpening {
  randomizers: ContestMap<string[]>
  commitmentRandomness: string
}

export interface ItemExpectation {
  content?: {
    [k: string]: unknown
  }
  type: BoardItemType
  parentAddress: string
}
export interface ClientState {
  electionConfig?: ElectionConfig
  voterSession?: VoterSessionItem
}

export type Signature = string;
export type HashValue = string;

export type BallotConfig = {
  [voterGroupId: string]: {
    contestUuids: string[]
  }
};

export type ContestConfig = {
  [contestUuid: string]: {
    options: Option[]
    markingType: MarkingType
    resultType: {
      name: string
    }
    title: LocalString
    subtitle: LocalString
    description: LocalString
  }
}

export type MarkingType = {
  style: string
  codeSize: number
  minMarks: number
  maxMarks: number
}
