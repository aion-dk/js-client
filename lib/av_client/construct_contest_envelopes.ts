import { validateBallotSelection } from './validate_selections'
import { InvalidStateError } from './errors'
import { generatePedersenCommitment } from './crypto/pedersen_commitment'
import { encryptContestSelections } from './encrypt_contest_selections'
import { BallotSelection, ContestEnvelope, ContestMap, ClientState } from './types'

export function constructContestEnvelopes( state: ClientState, ballotSelection: BallotSelection ): ConstructResult { 
  const { contestConfigs, ballotConfig, encryptionKey } = extractConfig(state)

  validateBallotSelection(ballotConfig, contestConfigs, ballotSelection)

  const contestEnvelopes = encryptContestSelections(contestConfigs, ballotSelection.contestSelections, encryptionKey)
  const envelopeRandomizers = contestEnvelopesRandomizers(contestEnvelopes)
  const pedersenCommitment = generatePedersenCommitment(envelopeRandomizers)

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
  envelopeRandomizers: ContestMap<string[]>
  contestEnvelopes: ContestEnvelope[],
}

function contestEnvelopesRandomizers( contestEnvelopes: ContestEnvelope[] ){
  const entries = contestEnvelopes.map(ce => [ce.reference, ce.randomizers])
  return Object.fromEntries(entries)
}

function extractConfig( state: ClientState ){
  const { voterGroup } = state.voterSession.content
  const { contestConfigs, ballotConfigs } = state.latestConfig.items
  const { encryptionKey } = state.latestConfig.items.thresholdConfig.content

  const ballotConfig = ballotConfigs[voterGroup]

  if( !ballotConfig ){
    throw new InvalidStateError('Cannot construct ballot cryptograms. Ballot config not found for voter')
  }

  return {
    ballotConfig,
    contestConfigs,
    encryptionKey
  }
}
