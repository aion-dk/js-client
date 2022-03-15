import { BallotConfig, CastVoteRecord } from "./types";

export const checkEligibility = (
  voterGroup: string,
  cvr: CastVoteRecord,
  ballotConfigs: BallotConfig
): ":okay" | ":not_eligible" => {

  const voterGroupConfig = ballotConfigs[voterGroup];

  if(!voterGroupConfig)
    throw new Error(`Ballot config not found for voter group: ${voterGroup}`);

  if(isVoterGroupContestsMatchingCvr(cvr, voterGroupConfig.contestUuids)) {
    return ":okay";
  }

  return ":not_eligible";
}

const isVoterGroupContestsMatchingCvr = (
  cvr: CastVoteRecord,
  voterGroupContestUuids: string[]
  ): boolean => {

  const cvrKeys = Object.keys(cvr).sort();
  const contestUuids = [...voterGroupContestUuids].sort();

  return cvrKeys.length === contestUuids.length
    && cvrKeys.every((key, i) => key === contestUuids[i])
}
