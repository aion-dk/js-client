export interface IAVClient {
  initialize(latestConfig: LatestConfig): Promise<void>
  initialize(): Promise<void>
  requestAccessCode(opaqueVoterId: string, email: string): Promise<void>
  validateAccessCode(code: string): Promise<void>
  registerVoter(): Promise<void>
  constructBallot(ballotSelection: BallotSelection): Promise<string>
  waitForVerifierRegistration(): Promise<string>
  spoilBallot(): Promise<string>
  castBallot (affidavit: Affidavit): Promise<BallotBoxReceipt>
  purgeData(): void
  challengeBallot(): Promise<void>
  checkBallotStatus(trackingCode: string): Promise<BallotStatus>
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

/**
 * A Base64-encoded string containing the affidavit
 */
export type Affidavit = string

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
  writeIn?: {
    maxSize: number
    encoding: 'utf8'
  }
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
  trackingCode: string
  receipt: {
    address: string
    dbbSignature: string
    voterSignature: string
  }
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
    votingRoundReference: string
    segments?: Segments
  }

  type: "VoterSessionItem"
  // Segments...
}

interface Segments {
  [key: string]: string
}

export interface BoardCommitmentItem extends BaseBoardItem {
  content: {
    commitment: string
  }

  type: "BoardEncryptionCommitmentItem"
}

export interface VoterCommitmentOpeningItem extends BaseVerificationItem {
  content: {
    package: EncryptedCommitmentOpening
  }
  type: "VoterEncryptionCommitmentOpeningItem"
}

export interface BoardCommitmentOpeningItem extends BaseVerificationItem {
  content: {
    package: EncryptedCommitmentOpening
  }
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

export type EncryptedCommitmentOpening = string;

export interface ItemExpectation {
  content?: {
    [k: string]: unknown
  }
  type: BoardItemType
  parentAddress: string
}

export type Signature = string;
export type HashValue = string;

export type MarkingType = {
  minMarks: number
  maxMarks: number
  blankSubmission: "disabled" | "active_choice" | "implicit"
  encoding: {
    codeSize: 1 | 2
    maxSize: number
    cryptogramCount: number
  }
}

export type BallotStatus = {
  status: string
  activities: {
    type: string,
    registered_at: string
  }
}

export interface AffidavitConfig {
  curve: string;
  encryptionKey: string;
}

export type BallotSelection = {
  reference: string
  contestSelections: ContestSelection[]
}

export type ContestSelection = {
  reference: string
  optionSelections: OptionSelection[]
}

export type OptionSelection = {
  reference: string
  text?: string
}

export type ContestEnvelope = {
  reference: string
  cryptograms: string[]
  randomizers: string[]
}

export type ReadableContestSelection = {
  reference: string
  title: string
  optionSelections: ReadableOptionSelection[]
}

export type ReadableOptionSelection = {
  reference: string
  title: string
  text?: string
}


// Latest Config
export interface LatestConfig {
  items: LatestConfigItems
  receipt?: string
  affidavit?: AffidavitConfig
}

export interface LatestConfigItems {
  thresholdConfig: ThresholdConfig;
  voterAuthorizerConfig: VoterAuthorizer;
  ballotConfigs: BallotConfigMap;
  contestConfigs: ContestConfigMap;
  votingRoundConfigs: VotingRoundConfigMap;
  electionConfig: ElectionConfig;
  genesisConfig: GenesisConfig;
  latestConfigItem: BaseBoardItem;
}


// Threshold Config Item
export interface ThresholdConfig {
  content: ThresholdConfigContent
}

export type ThresholdConfigContent = {
  encryptionKey: string
}

// Voter Authorizer Item
export interface VoterAuthorizer {
  content: VoterAuthorizerContent
} 

export interface VoterAuthorizerContent {
  identityProvider: VoterAuthorizerContentItem
  voterAuthorizer: VoterAuthorizerContentItem
}

export interface VoterAuthorizerContentItem {
  contextUuid: string
  publicKey: string
  url: string
  authorizationMode?: string
}

// Ballot Config Item
export type BallotConfigMap = {
  [voterGroupId: string]: BallotConfig
}

export type BallotConfig = {
  content: BallotContent
}

export interface BallotContent {
  reference: string
  voterGroup: string
  contestReferences: string[]
}

// Contest Config Item
export type ContestConfigMap = {
  [contestReference: string]: ContestConfig
}

export type ContestConfig = {
  content: ContestContent
}

export interface ContestContent {
  reference: string
  title: LocalString
  subtitle: LocalString
  description: LocalString
  markingType: MarkingType
  resultType: ResultType
  options: OptionContent[]
}

export interface ResultType {
  name: string
}

export interface OptionContent {
  reference: string;
  code: number;
  children?: Option[];
  title: LocalString;
  subtitle: LocalString;
  description: LocalString;
  writeIn?: {
    maxSize: number
    encoding: 'utf8'
  }
}

// Voting Round Config Item
export type VotingRoundConfigMap = {
  [votingRoundReference: string]: VotingRoundConfig
}

export type VotingRoundConfig = {
  content: VotingRoundContent
}

export interface VotingRoundContent {
  reference: string
  status: "open" | "scheduled" | "disabled"
  resultPublicationDelay: number
  contestReferences: string[]
}

// Election Config Item
export type ElectionConfig = {
  content: ElectionConfigContent
}

export interface ElectionConfigContent{
  title: LocalString
  uuid: string
  status?: string
  locales?: string[]
  sessionTimeout?: number
  castRequestItemAttachmentEncryptionKey?: string
  requireCastRequestAttachment?: boolean
  bcTimeout?: number
  schedule?: {
    from: string
    to: string
  }
}

// Genesis Config Item
export type GenesisConfig = {
  content: GenesisConfigContent
}

export interface GenesisConfigContent {
  ballotAcceptance: string
  eaCurveName: string
  eaPublicKey: string
  electionSlug: string
  publicKey: string
  resultExtraction: string
}

// We define the client state to only require a subset of the electionConfig and voterSession
// This enables us to do less setup in testing. 
// If any of the objects passed does not contain the required properties, then the build step will fail.
export interface ClientState {
  latestConfig: LatestConfig
  voterSession: { 
    content: { 
      voterGroup: string 
    } 
  }
}
