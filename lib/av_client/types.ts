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

export interface EncryptedPile {
  multiplier: number;
  cryptograms: string[];
  randomizers: string[];
}

export interface SealedPile {
  multiplier: number;
  cryptograms: string[];
}


export type KeyPair = {
  privateKey: string;
  publicKey: string;
}

/**
 * A Base64-encoded string containing the affidavit
 */
export type Affidavit = string

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

export interface BaseBoardItem {
  address: string
  author: string
  parentAddress: string
  previousAddress: string
  registeredAt: string
  signature: string
}

export interface BaseVerificationItem extends BaseBoardItem {
  shortAddress: string
}

export interface VoterSessionItem extends BaseBoardItem {
  content: {
    authToken: string
    identifier: string
    voterGroup: string
    publicKey: string
    votingRoundReference: string
    weight: number
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
    contests: ContestMap<SealedPile[]>
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
  randomizers: ContestMap<string[][]>
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

export interface MarkingType {
  minMarks: number
  maxMarks: number
  maxPiles?: number
  voteVariation?: string
  blankSubmission: "disabled" | "active_choice" | "implicit"
  encoding: {
    codeSize: number
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
  piles: SelectionPile[]
}

export type SelectionPile = {
  multiplier: number,
  optionSelections: OptionSelection[]
}

export type OptionSelection = {
  reference: string
  text?: string
}

export type ContestEnvelope = {
  reference: string
  piles: EncryptedPile[]
}

export type ReadableContestSelection = {
  reference: string
  title: string
  piles: ReadableSelectionPile[]
}

export type ReadableSelectionPile = {
  multiplier: number,
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
  thresholdConfig: ThresholdConfig
  voterAuthorizerConfig: VoterAuthorizer
  ballotConfigs: BallotConfigMap
  contestConfigs: ContestConfigMap
  votingRoundConfigs: VotingRoundConfigMap
  electionConfig: ElectionConfig
  genesisConfig: GenesisConfig
  latestConfigItem: LatestConfigurationConfig
  segmentsConfig: SegmentsConfigMap | null
  extractionIntents?: ExtractionIntents
  extractionData?: ExtractionData
  extractionConfirmations?: ExtractionConfirmations
}

export interface LatestConfigurationConfig extends BaseBoardItem {
  type: 'ThresholdConfigItem'
    | 'VoterAuthorizationConfigItem'
    | 'BallotConfigItem'
    | 'ContestConfigItem'
    | 'VotingRoundConfigItem'
    | 'ElectionConfigItem'
    | 'GenesisItem'
    | 'SegmentsConfigItem'
  content: VoterAuthorizerContent
    | ThresholdConfigContent
    | BallotContent
    | ContestContent
    | VotingRoundContent
    | ElectionConfigContent
    | GenesisConfigContent
    | SegmentsConfigContent
}

// Threshold Config Item
export interface ThresholdConfig extends BaseBoardItem {
  content: ThresholdConfigContent
  type: 'ThresholdConfigItem'
}

export interface ThresholdConfigContent {
  encryptionKey: string
  threshold: number
  trustees: Trustee[]
}

export interface Trustee {
  publicKey: string
  id: number
  polynomialCoefficients: PolynomialCoefficient[]
}

export interface PolynomialCoefficient {
  degree: number
  coefficient: string
}

// Voter Authorizer Item
export interface VoterAuthorizer extends BaseBoardItem {
  content: VoterAuthorizerContent
  type: 'VoterAuthorizationConfigItem'
}

export interface VoterAuthorizerContent {
  identityProvider: VoterAuthorizerContentItem
  voterAuthorizer: VoterAuthorizerContentItem
}

export interface VoterAuthorizerContentItem {
  contextUuid: string
  publicKey: string
  url: string
  authorizationMode?: 'proof-of-identity' | 'proof-of-election-codes'
}

// Ballot Config Item
export interface BallotConfigMap {
  [voterGroupId: string]: BallotConfig
}

export interface BallotConfig extends BaseBoardItem {
  content: BallotContent
  type: 'BallotConfigItem'
}

export interface BallotContent {
  reference: string
  voterGroup: string
  contestReferences: string[]
  attachment?: string
}

// Contest Config Item
export interface ContestConfigMap {
  [contestReference: string]: ContestConfig
}

export interface ContestConfig extends BaseBoardItem {
  content: ContestContent
  type: 'ContestConfigItem'
}

export interface ContestContent {
  reference: string
  title: LocalString
  subtitle?: LocalString
  question?: LocalString
  description?: LocalString
  markingType: MarkingType
  resultType: ResultType
  options: OptionContent[]
  identifiable?: boolean
  contestPositions?: ContestPositionMap
}

export interface ResultType {
  name: string
}

export interface OptionContent {
  reference: string;
  code: number;
  children?: OptionContent[];
  title: LocalString;
  subtitle?: LocalString;
  description?: LocalString;
  writeIn?: {
    maxSize: number
    encoding: 'utf8'
  }
}

// Voting Round Config Item
export interface VotingRoundConfigMap {
  [votingRoundReference: string]: VotingRoundConfig
}

export interface VotingRoundConfig extends BaseBoardItem {
  content: VotingRoundContent
  type: 'VotingRoundConfigItem'
}

export interface VotingRoundContent {
  reference: string
  status: "open" | "scheduled" | "closed"
  resultPublicationDelay?: number
  schedule?: {
    from: string
    to: string
  }
  contestReferences: string[]
  demo?: boolean
  identifiable?: boolean
  contestPositions?: ContestPositionMap;
}

// Election Config Item
export interface ElectionConfig extends BaseBoardItem {
  content: ElectionConfigContent
  type: 'ElectionConfigItem'
}

export interface ElectionConfigContent {
  address?: string
  title: LocalString
  subtitle?: LocalString
  description?: LocalString
  uuid: string
  status: string
  locales: string[]
  sessionTimeout?: number
  numDaysToCureAffidavits?: number
  castRequestItemAttachmentEncryptionKey?: string
  requireCastRequestAttachment?: boolean
  uocavaOpeningDate?: string
  nonUocavaOpeningDate?: string
  extractionThreshold?: number
  rejectionReasons?: string[]
  bcTimeout?: number
  schedule?: {
    from: string
    to: string
  }
}

// Genesis Config Item
export interface GenesisConfig extends BaseBoardItem {
  parentAddress: '0000000000000000000000000000000000000000000000000000000000000000'
  previousAddress: '0000000000000000000000000000000000000000000000000000000000000000'
  content: GenesisConfigContent
  type: 'GenesisItem'
}

export interface GenesisConfigContent {
  ballotAcceptance: 'inferred' | 'manual'
  eaCurveName: 'secp256r1' | 'secp384r1'| 'secp521r1' | 'secp256k1'
  eaPublicKey: string
  electionSlug: string
  publicKey: string
  resultExtraction: 'post-election' | 'throughout-election'
}

// Segments Config Item
export interface SegmentsConfigMap {
  [segments: string]: SegmentsConfig
}

export interface ContestPositionMap {
    [contestReference: string]: number;
}

export interface SegmentsConfig extends BaseBoardItem {
  content: SegmentsConfigContent
  type: 'SegmentsConfigItem'
}
export interface SegmentsConfigContent {
  segments: string[]
}

// Extraction Items
export interface ExtractionData {
  votingRoundReference?: string
}

export interface ExtractionIntentsMap {
  [extractionIntent: string]: ExtractionIntents
}

export interface ExtractionIntents {
  extractionIntent?: any
  receipt?: string
  meta?: {
    pollingUrl: string | undefined
  },
}

export interface ExtractionConfirmations {
  parentAddress?: string
  signature?: string
  content?: string
  attachment?: string
}

// We define the client state to only require a subset of the electionConfig and voterSession
// This enables us to do less setup in testing.
// If any of the objects passed does not contain the required properties, then the build step will fail.
export interface ClientState {
  latestConfig: LatestConfig
  votingRoundReference: string
  voterSession: VoterSessionItem
}
