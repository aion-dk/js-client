import { validateCvr } from '../cvr_validation';
import { checkEligibility } from '../eligibility_check';

import EncryptVotes from '../encrypt_votes';

import {
  CorruptCvrError,
} from '../errors';

import {
  Ballot,
  CastVoteRecord,
  ClientState,
  ContestMap,
  MarkingType,
  OpenableEnvelope
} from '../types';

import {
  InvalidStateError,
} from '../errors';
import { generatePedersenCommitment } from '../crypto/pedersen_commitment';

const DEFAULT_MARKING_TYPE: MarkingType = {
  minMarks: 1,
  maxMarks: 1,
  encoding: {
    codeSize: 1,
    maxSize: 1,
    cryptogramCount: 1
  }
};

const _getEncodingTypes = (cvr: CastVoteRecord, ballots: Ballot[]) => {
  return Object.fromEntries(Object.keys(cvr).map((contestId) => {
    const contest = ballots.find(b => b.id.toString() == contestId)

    // We can use non-null assertion for contest because selections have been validated
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return [contestId, contest!.vote_encoding_type];
  }))
};

export const constructBallotCryptograms = (state: ClientState, cvr: CastVoteRecord): ConstructResult => { 
  if(!state.voterSession) {
    throw new InvalidStateError('Cannot construct ballot cryptograms. Voter registration not completed successfully');
  }

  if(!state.electionConfig) {
    throw new InvalidStateError('Cannot construct ballot cryptograms. No election configuration present');
  }

  const { voterGroup } = state.voterSession.content;
  const { contestConfigs, ballotConfigs, encryptionKey } = state.electionConfig;

  switch(checkEligibility(voterGroup, cvr, ballotConfigs)) {
    case ":not_eligible":  throw new CorruptCvrError('Corrupt CVR: Not eligible');
    case ":okay":
  }

  switch(validateCvr(cvr, voterGroup, ballotConfigs, contestConfigs)) {
    case ":invalid_contest": throw new CorruptCvrError('Corrupt CVR: Contains invalid contest');
    case ":invalid_option": throw new CorruptCvrError('Corrupt CVR: Contains invalid option');
    case ":okay":
  }

  const envelopes = EncryptVotes.encrypt(
    state.electionConfig.contestConfigs,
    cvr,
    DEFAULT_MARKING_TYPE,
    encryptionKey
  );

  // TODO:
  // Do we need: const numberOfCryptogramsNeeded = this.calculateNumberOfRequiredCryptograms(cvr, ballots[voterGroup]);
  
  const randomizersMap = Object.fromEntries(Object.entries(envelopes).map(([contestReference, envelope]) => [contestReference, envelope.randomness]));
  const result = generatePedersenCommitment(randomizersMap);

  const trackingCode = EncryptVotes.fingerprint(extractCryptograms(envelopes));

  return {
    commitment: {
      result: result.commitment,
      randomizer: result.randomizer
    },
    envelopeRandomizers: randomizersMap,
    envelopes,
    trackingCode,
  }
}

/**
 * Returns data for rendering the list of cryptograms of the ballot
 * @param Map of openable envelopes with cryptograms
 * @return Object containing a cryptogram for each contest
 */
const extractCryptograms = (envelopes: ContestMap<OpenableEnvelope>): ContestMap<Cryptogram[]> => {
  return Object.fromEntries(Object.keys(envelopes).map(contestId => [contestId, envelopes[contestId].cryptograms ]))
}

type Cryptogram = string;

type ConstructResult = {
  commitment: {
    result: string,
    randomizer: string
  }
  envelopeRandomizers: ContestMap<string[]>
  envelopes: ContestMap<OpenableEnvelope>,
  trackingCode: string,
}
