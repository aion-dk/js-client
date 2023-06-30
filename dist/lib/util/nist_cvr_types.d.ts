export interface CVRRoot {
    "@type": "CVR.CastVoteRecordReport";
    Version: "1.0.0";
    CVR: CVR[];
    Election: Election[];
    GeneratedDate: string;
    GpUnit: GpUnit[];
    ReportGeneratingDeviceIds: string[];
    ReportingDevice: ReportingDevice[];
}
interface CVR {
    CurrentSnapshotId: string;
    CVRSnapshot: CVRSnapshot[];
    ElectionId: string;
    "@type": "CVR.CVR";
}
interface CVRSnapshot {
    "@type": "CVR.CVRSnapshot";
    "@id": string;
    Type: string;
    CVRContest: CVRContest[];
}
export interface CVRContest {
    "@type": "CVR.CVRContest";
    ContestId: string;
    CVRContestSelection: CVRContestSelection[];
}
export interface CVRContestSelection {
    "@type": "CVR.CVRContestSelection";
    ContestSelectionId: string;
    SelectionPosition: SelectionPosition[];
}
interface SelectionPosition {
    "@type": "CVR.SelectionPosition";
    IsAllocable: "yes" | "no";
    HasIndication: "yes" | "no";
    NumberVotes: number;
    CVRWriteIn?: CVRWriteIn;
}
interface CVRWriteIn {
    "@type": "CVR.CVRWriteIn";
    Text: string;
}
interface Election {
    "@type": "CVR.Election";
    "@id": string;
    Candidate: Candidate[];
    Contest: Array<Contest | CandidateContest | BallotMeasureContest>;
    ElectionScopeId?: string;
}
interface Candidate {
    "@type": "CVR.Candidate";
    "@id": string;
}
interface CandidateContest {
    "@type": "CVR.CandidateContest";
    "@id": string;
    ContestSelection: CandidateSelection[];
}
interface BallotMeasureContest {
    "@type": "CVR.BallotMeasureContest";
    "@id": string;
    ContestSelection: BallotMeasureSelection[];
}
interface Contest {
    "@type": "CVR.Contest";
    "@id": string;
    ContestSelection: ContestSelection[];
}
interface CandidateSelection {
    "@type": "CVR.CandidateSelection";
    "@id": string;
    "CandidateIds": string[];
}
interface BallotMeasureSelection {
    "@type": "CVR.BallotMeasureSelection";
    "@id": string;
    "Selections": "yes" | "no";
}
interface ContestSelection {
    "@type": "CVR.ContestSelection";
    "@id": string;
    "Selection": "yes" | "no";
}
interface GpUnit {
    "@type": "CVR.GpUnit";
    "@id": string;
    "Type": string;
}
interface ReportingDevice {
    "@type": "CVR.ReportingDevice";
    "@id": string;
    Application: string;
}
export {};
