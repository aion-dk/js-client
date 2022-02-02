import { BallotConfig, CastVoteRecord, ContestConfig } from './types';

type ValidationResult = ':okay'
  | ':invalid_option'
  | ':invalid_contest'
  | ':missing_contest_in_cvr'

const validateCvr = (
  cvr: CastVoteRecord,
  voterGroup: string,
  ballotConfigs: BallotConfig,
  allContests: ContestConfig) : ValidationResult => {

  const ballotConfig = ballotConfigs[voterGroup];

  const hasOnlyVotedForValidContests = Object.keys(cvr)
    .map(cvrUuid => ballotConfig.contestUuids.includes(cvrUuid))
    .every(found => found);

  const hasVotedForAllContests = ballotConfig.contestUuids.every(uuid => cvr[uuid] !== undefined);

  const areSelectedOptionsValid = Object.keys(cvr).every(contestUuid => {
    const contest = allContests[contestUuid];

    if (!contest)
      return false;

    const validOptions = contest.options.map(option => option.handle);
    const selectedOption = cvr[contestUuid];

    return validOptions.includes(selectedOption);
  });

  if(!hasOnlyVotedForValidContests) return ':invalid_contest';
  if(!hasVotedForAllContests) return ':missing_contest_in_cvr';
  if(!areSelectedOptionsValid) return ':invalid_option';

  return ':okay';
}

export {
  validateCvr
}
