import { BallotConfig, CastVoteRecord } from "./types";

export const checkEligibility = (
  voterGroup: string,
  cvr: CastVoteRecord,
  ballotConfigs: BallotConfig[]
): ":okay" | ":not_eligible" => {

  const ballotConfig = ballotConfigs.find(bc => bc.voterGroup === voterGroup);
  // TODO: Null-check ballot

  const cvrKeys = Object.keys(cvr).sort();
  const contestUuids = [...ballotConfig!.contestUuids].sort();

  if(cvrKeys.length === contestUuids.length
    && cvrKeys.every((key, i) => key === contestUuids[i])) {
    return ":okay";
  }

  return ":not_eligible";
}
