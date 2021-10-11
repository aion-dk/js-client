import { CastVoteRecord, Ballot } from './types';

type ValidationResult = ':okay' | ':invalid_option' | ':invalid_contest'

const validateCvr = (cvr: CastVoteRecord, contests: Ballot[]) : ValidationResult => {
  // TODO: Assuming that the voter has access to - exactly - all contests from election config.
  const hasVotedForAllContests = JSON.stringify(Object.keys(cvr).map(k => parseInt(k))) === JSON.stringify(contests.map(c => c.id))

  const areSelectedOptionsValid = Object.keys(cvr).every(function(contestId) {
    const contest = contests.find(_contest => _contest.id.toString() == contestId)
    if (!contest) return false;

    const validOptions = contest.options.map(option => option.handle);
    const selectedOption = cvr[contestId];
    return validOptions.includes(selectedOption);
  })

  if(!hasVotedForAllContests) return ':invalid_contest'
  if(!areSelectedOptionsValid) return ':invalid_option'
  return ':okay'
}

export {
  validateCvr
}