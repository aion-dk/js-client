import {
  BallotConfig,
  BallotSelection,
  ContestSelection,
  OptionSelection,
  ContestConfig,
  ContestConfigMap,
  OptionContent,
  VotingRoundConfig,
  SelectionPile, MarkingType
} from './types';
import { flattenOptions } from './flatten_options'
import { CorruptSelectionError as CorruptSelectionError } from './errors';

export function validateBallotSelection( ballotConfig: BallotConfig, contestConfigs: ContestConfigMap, ballotSelection: BallotSelection, votingRoundConfig: VotingRoundConfig, weight: number ){
  if( ballotConfig.content.reference !== ballotSelection.reference ){
    throw new CorruptSelectionError('Ballot selection does not match ballot config')
  }

  validateContestsMatching(ballotConfig, ballotSelection, votingRoundConfig)

  ballotSelection.contestSelections.forEach(contestSelection => {
    const contestConfig = getContestConfig(contestConfigs, contestSelection)
    validateContestSelection(contestConfig, contestSelection, weight)
  })
}

export function validateContestSelection( contestConfig: ContestConfig, contestSelection: ContestSelection, weight: number ){
  if( contestConfig.content.reference !== contestSelection.reference ){
    throw new CorruptSelectionError('Contest selection is not matching contest config')
  }

  const { markingType, options } = contestConfig.content

  // Validate maxPiles allowed
  if(markingType.maxPiles && markingType.maxPiles > contestSelection.piles.length) {
    throw new CorruptSelectionError('Weight is distributed more than allowed.')
  }

  // Validate weight versus pile multipliers
  if(weight < contestSelection.piles.reduce((sum, pile) => sum + pile.multiplier, 0)) {
    throw new CorruptSelectionError('Selection sum is larger than voting weight.')
  }

  contestSelection.piles.forEach(pile => validateSelectionPile(pile, markingType, options))
}

function validateSelectionPile(pile: SelectionPile, markingType: MarkingType, options: OptionContent[]) {
  const isBlank = pile.optionSelections.length === 0

  const getOption = makeGetOption(options)

  // Validate blankSubmission
  if( isBlank && markingType.blankSubmission === 'disabled'){
    throw new CorruptSelectionError('Blank submissions are not allowed in this contest')
  }

  pile.optionSelections.forEach(optionSelection => {
    const option = getOption(optionSelection)

    // Validate that mark count is within bounds

    const isExlusive = pile.optionSelections?.length && option?.exclusive
    const calculatedMinMarks = !isBlank && isExlusive ? 1 : markingType.minMarks;

    if( !isBlank && !withinBounds(calculatedMinMarks, pile.optionSelections.length, markingType.maxMarks) ){
      throw new CorruptSelectionError('Contest selection does not contain a valid amount of option selections')
    }

    if( option.writeIn ){
      if( !optionSelection.text ){
        throw new CorruptSelectionError('Expected write in text missing for option selection')
      }

      const textByteSize = new TextEncoder().encode(optionSelection.text).length
      if( option.writeIn.maxSize < textByteSize ){
        throw new CorruptSelectionError('Max size exceeded for write in text')
      }
    }
  })
}

function getContestConfig( contestConfigs: ContestConfigMap, contestSelection: ContestSelection ){
  const contestConfig = contestConfigs[contestSelection.reference]
  if( contestConfig ) return contestConfig
  throw new CorruptSelectionError('Contest config not found')
}

function validateContestsMatching( ballotConfig: BallotConfig, ballotSelection: BallotSelection, votingRoundConfig: VotingRoundConfig ){
  const availableContests = votingRoundConfig.content.contestReferences.filter(value => ballotConfig.content.contestReferences.includes(value));
  const selectedContests = ballotSelection.contestSelections.map(cs => cs.reference)

  if( !containsSameStrings(availableContests, selectedContests) ){
    throw new CorruptSelectionError('Contest selections do not match the contests allowed by the ballot or voting round')
  }
}

function makeGetOption(options: OptionContent[]){
  const flatOptions = flattenOptions(options)
  const referenceMap = Object.fromEntries(flatOptions.map(o => [o.reference, o]))

  return (optionSelection: OptionSelection) => {
    const option = referenceMap[optionSelection.reference]
    if( option ) return option
    throw new CorruptSelectionError('Option config not found')
  }
}

function withinBounds(min: number, n: number, max: number){
  return min <= n && n <= max
}

function containsSameStrings( array1: string[], array2: string[] ){
  const cloned1 = [...array1]
  const cloned2 = [...array2]

  cloned1.sort()
  cloned2.sort()

  return JSON.stringify(cloned1) === JSON.stringify(cloned2)
}
