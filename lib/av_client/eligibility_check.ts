import { BallotConfig, CastVoteRecord } from "./types";

export const checkEligibility = (
  voterGroup: string,
  cvr: CastVoteRecord,
  ballotConfigs: BallotConfig
): ":okay" | ":not_eligible" => {

  const voterGroupConfig = ballotConfigs["4"];

  console.log(`Voter group '${voterGroup}'`, JSON.stringify(ballotConfigs), voterGroupConfig);

  if(!voterGroupConfig)
    throw new Error(`Ballot config not found for voter group: ${voterGroup}`);

  const cvrKeys = Object.keys(cvr).sort();
  const contestUuids = [...voterGroupConfig.contestUuids].sort();

  if(cvrKeys.length === contestUuids.length
    && cvrKeys.every((key, i) => key === contestUuids[i])) {
    return ":okay";
  }

  return ":not_eligible";
}
