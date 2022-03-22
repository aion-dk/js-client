import { BallotConfig, CastVoteRecord, ContestConfig } from './types';
import { flattenOptions } from './flatten_options'

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
    .map(contestReference => ballotConfig.contestReferences.includes(contestReference))
    .every(found => found);

  const hasVotedForAllContests = ballotConfig.contestReferences.every(reference => cvr[reference] !== undefined);

  const areSelectedOptionsValid = Object.keys(cvr).every(contestReference => {
    const contest = allContests[contestReference];

    if(!contest)
      return false;

    const validOptions = flattenOptions(contest.options).map(option => option.reference)
    const selectedOption = cvr[contestReference];

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
