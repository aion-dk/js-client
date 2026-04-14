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

export interface Election {
  enabled: boolean;
  id: number;
  title: LocalString;
  subtitle: LocalString;
  description: LocalString;
  //...
}

// We define the client state to only require a subset of the electionConfig and voterSession
// This enables us to do less setup in testing.
// If any of the objects passed does not contain the required properties, then the build step will fail.

export interface ClientState {
  latestConfig: LatestConfig
  votingRoundReference: string
  voterSession: VoterSessionItem
}
