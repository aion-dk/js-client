export interface CastVoteRecordReport {
  CVR: CVR
}

export interface CVR {
  CurrentSnapshotId: TextElement
  CVRSnapshot: CVRSnapshot | CVRSnapshot[]
  ElectionId: TextElement
}

export interface CVRSnapshot {
  Type: TextElement
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
  HasIndication: TextElement
  IsAllocable: TextElement
  NumberVotes: TextElement
}

interface TextElement {
  text: string
}
