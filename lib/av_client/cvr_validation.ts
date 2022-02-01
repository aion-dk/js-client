import { CastVoteRecord, ContestConfig } from './types';

type ValidationResult = ':okay' | ':invalid_option' | ':invalid_contest'

const validateCvr = (cvr: CastVoteRecord, contests: ContestConfig[]) : ValidationResult => {
  // TODO: Assuming that the voter has access to - exactly - all contests from election config.
  const hasVotedForAllContests = JSON.stringify(Object.keys(cvr).map(k => k)) === JSON.stringify(contests.map(c => c.uuid))

  const areSelectedOptionsValid = Object.keys(cvr).every(contestUuid => {
    const contest = contests.find(_contest => _contest.uuid == contestUuid)
    if (!contest) return false;

    const validOptions = contest.options.map(option => option.handle);
    const selectedOption = cvr[contestUuid];

    return validOptions.includes(selectedOption);
  });

  if(!hasVotedForAllContests) return ':invalid_contest'
  if(!areSelectedOptionsValid) return ':invalid_option'
  return ':okay'
}

export {
  validateCvr
}
