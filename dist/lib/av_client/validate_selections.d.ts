import { BallotConfig, BallotSelection, ContestSelection, ContestConfig, ContestConfigMap, VotingRoundConfig } from './types';
export declare function validateBallotSelection(ballotConfig: BallotConfig, contestConfigs: ContestConfigMap, ballotSelection: BallotSelection, votingRoundConfig: VotingRoundConfig, weight: number): void;
export declare function validateContestSelection(contestConfig: ContestConfig, contestSelection: ContestSelection, weight: number): void;
