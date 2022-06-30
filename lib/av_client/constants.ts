import { BoardItemType } from "./types"

export const BALLOT_CRYPTOGRAMS_ITEM: BoardItemType = "BallotCryptogramsItem";
export const VOTER_SESSION_ITEM: BoardItemType = "VoterSessionItem";
export const VOTER_COMMITMENT_ITEM: BoardItemType = "VoterEncryptionCommitmentItem";
export const BOARD_COMMITMENT_ITEM: BoardItemType = "BoardEncryptionCommitmentItem";
export const CAST_REQUEST_ITEM: BoardItemType = "CastRequestItem";
export const SPOIL_REQUEST_ITEM: BoardItemType = "SpoilRequestItem";
export const VERIFIER_ITEM: BoardItemType = "VerifierItem";
export const VERIFICATION_START_ITEM: BoardItemType =  "VerificationStartItem";
export const VOTER_ENCRYPTION_COMMITMENT_OPENING_ITEM = "VoterEncryptionCommitmentOpeningItem"

export const MAX_POLL_ATTEMPTS = 600;
export const POLLING_INTERVAL_MS = 1000;
