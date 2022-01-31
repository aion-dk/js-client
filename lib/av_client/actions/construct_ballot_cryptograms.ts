import {
  Ballot,
  CastVoteRecord,
  ClientState
} from '../types';

import {
  CorruptCvrError,
  InvalidStateError,
} from '../errors';

import { validateCvr } from '../cvr_validation';

import EncryptVotes from '../encrypt_votes';

import { generatePedersenCommitment } from '../crypto/pedersen_commitment';

const calculateNumberOfRequiredCryptograms = (cvr: CastVoteRecord, ballot: Ballot): number => {
  return 2;
}

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

  const { voterGroup } = state.voterSession!;

  const { ballots, encryptionKey } = state.electionConfig!;

  switch(validateCvr(cvr, ballots)) {
    case ":invalid_contest": throw new CorruptCvrError('Corrupt CVR: Contains invalid contest');
    case ":invalid_option": throw new CorruptCvrError('Corrupt CVR: Contains invalid option');
    case ":okay":
  }

  const encodingTypes = getEncodingTypes(cvr, ballots);
  const numberOfCryptogramsNeeded = calculateNumberOfRequiredCryptograms(cvr, ballots[voterGroup]); // TODO: Use?

  const envelopes = EncryptVotes.encrypt(cvr, encodingTypes, encryptionKey);

  const randomizers = getSortedEnvelopeRandomizers(envelopes);    // Get cryptogram randomizers sorted by contest

  // generate commitment
  const result = generatePedersenCommitment(randomizers);
  
  // Submit commitment // TODO: Move imperative side-effect to parent (caller method)
  result.commitment;

  // get empty cryptograms
  //const trackingCode = EncryptVotes.fingerprint(this.extractCryptograms(envelopes));

  //voteEncryptions = envelopes

  //return trackingCode;
  return result;
}
