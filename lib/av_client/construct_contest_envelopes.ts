import { validateBallotSelection } from './validate_selections'
import { InvalidStateError } from './errors'
import { generateCommitment } from './new_crypto/commitments'
import { encryptContestSelections } from './new_crypto/encrypt_contest_selections'
import { BallotSelection, ContestEnvelope, ContestMap, ClientState } from './types'

export function constructContestEnvelopes( state: ClientState, ballotSelection: BallotSelection ): ConstructResult {
  const { contestConfigs, ballotConfig, encryptionKey, votingRoundConfig, weight } = extractConfig(state)

  validateBallotSelection(ballotConfig, contestConfigs, ballotSelection, votingRoundConfig, weight)

  const contestEnvelopes = encryptContestSelections(contestConfigs, ballotSelection.contestSelections, encryptionKey)
  const envelopeRandomizers = extractRandomizers(contestEnvelopes)
  const pedersenCommitment = generateCommitment(envelopeRandomizers)

  return {
    pedersenCommitment,
    envelopeRandomizers,
    contestEnvelopes,
  }
}

type ConstructResult = {
  pedersenCommitment: {
    commitment: string,
    randomizer: string
  }
  envelopeRandomizers: ContestMap<string[][]>,
  contestEnvelopes: ContestEnvelope[],
}

function extractRandomizers( contestEnvelopes: ContestEnvelope[]): ContestMap<string[][]> {
  const randomizers = ce => ce.piles.map((p): string[] => {
    return p.randomizers
  })

  const entries = contestEnvelopes.map(ce => [ce.reference, randomizers(ce)])
  return Object.fromEntries(entries)
}

function extractConfig( state: ClientState ){
  const { voterGroup, weight } = state.voterSession.content
  const { contestConfigs, ballotConfigs, votingRoundConfigs } = state.latestConfig.items
  const { encryptionKey } = state.latestConfig.items.thresholdConfig.content
  const ballotConfig = ballotConfigs[voterGroup]
  const votingRoundConfig = votingRoundConfigs[state.votingRoundReference]


  if( !ballotConfig ){
    throw new InvalidStateError('Cannot construct ballot cryptograms. Ballot config not found for voter')
  }

  return {
    ballotConfig,
    contestConfigs,
    encryptionKey,
    votingRoundConfig,
    weight,
  }
}
