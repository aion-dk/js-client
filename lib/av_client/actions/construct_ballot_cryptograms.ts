import {
  Ballot,
  CastVoteRecord,
  ClientState
} from '../types';

import {
  InvalidStateError,
} from '../errors';

const assertValidState = (state: ClientState) => {
  if(!state.voterSession) {
    throw new InvalidStateError('Cannot construct ballot cryptograms. Voter registration not completed successfully');
  }

  if(!state.electionConfig) {
    throw new InvalidStateError('Cannot construct ballot cryptograms. No election configuration present');
  }
};

const getSortedEnvelopeRandomizers = (envelopes) => {
  return Object.keys(envelopes)
    .sort((a,b) => ('' + a).localeCompare(b))
    .map(key => envelopes[key].randomness)
};

const getEncodingTypes = (cvr: CastVoteRecord, ballots: Ballot[]) => {
  return Object.fromEntries(Object.keys(cvr).map((contestId) => {
    const contest = ballots.find(b => b.id.toString() == contestId)

    // We can use non-null assertion for contest because selections have been validated
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return [contestId, contest!.vote_encoding_type];
  }))
};

export const constructBallotCryptograms = async (state: ClientState, cvr: CastVoteRecord) => { // TODO: Return type
  assertValidState(state);

  // TODO: Extract from av_client
}
