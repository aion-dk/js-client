import { BallotConfig, CastVoteRecord } from "./types";

export const checkEligibility = (
  voterGroup: string,
  cvr: CastVoteRecord,
  ballotConfigs: BallotConfig
): ":okay" | ":not_eligible" => {

  const voterGroupConfig = ballotConfigs[voterGroup];

  if(!voterGroupConfig)
    throw new Error(`Ballot config not found for voter group: ${voterGroup}`);

  if(isVoterGroupContestsMatchingCvr(cvr, voterGroupConfig.contestReferences)) {
    return ":okay";
  }

  return ":not_eligible";
}

const isVoterGroupContestsMatchingCvr = (
  cvr: CastVoteRecord,
  voterGroupContestReferences: string[]
  ): boolean => {

  const cvrKeys = Object.keys(cvr).sort();
  const contestReferences = [...voterGroupContestReferences].sort();

  return cvrKeys.length === contestReferences.length
    && cvrKeys.every((key, i) => key === contestReferences[i])
}
