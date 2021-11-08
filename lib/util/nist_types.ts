export interface CastVoteRecordReport {
  CVR: CVR
}

export interface CVR {
  CurrentSnapshotId: string
  CVRSnapshot: CVRSnapshot | CVRSnapshot[]
  ElectionId: string
}

export interface CVRSnapshot {
  Type: string
  _attributes: { ObjectId: string }
  CVRContest: undefined | CVRContest | CVRContest[]
}

export interface CVRContest {
  ContestId: TextElement
  CVRContestSelection: undefined | CVRContestSelection | CVRContestSelection[]
}

interface CVRContestSelection {
  ContestSelectionId: TextElement  // in documentation?
  SelectionPosition: SelectionPosition | SelectionPosition[]
}

interface SelectionPosition {
  HasIndication: string
  IsAllocable: string
  NumberVotes: number
}

interface TextElement {
  text: string
}
