import { BallotConfig, BallotSelection, ContestSelection, OptionSelection, ContestConfig, ContestConfigMap, Option } from './types';
import { flattenOptions } from './flatten_options'
import { CorruptSelectionError as CorruptSelectionError } from './errors';

export function validateBallotSelection( ballotConfig: BallotConfig, contestConfigs: ContestConfigMap, ballotSelection: BallotSelection ){
  if( ballotConfig.content.reference !== ballotSelection.reference ){
    throw new CorruptSelectionError('Ballot selection does not match ballot config')
  }

  validateContestsMatching(ballotConfig, ballotSelection)

  ballotSelection.contestSelections.forEach(contestSelection => {
    const contestConfig = getContestConfig(contestConfigs, contestSelection)
    validateContestSelection(contestConfig, contestSelection)
  })
}

export function validateContestSelection( contestConfig: ContestConfig, contestSelection: ContestSelection ){
  if( contestConfig.content.reference !== contestSelection.reference ){
    throw new CorruptSelectionError('Contest selection is not matching contest config')
  }

  const { markingType, options } = contestConfig.content

  const isBlank = contestSelection.optionSelections.length === 0

  // Validate blankSubmission
  if( isBlank && markingType.blankSubmission == 'disabled'){
    throw new CorruptSelectionError('Blank submissions are not allowed in this contest')
  }

  // Validate that mark count is within bounds
  if( !isBlank && !withinBounds(markingType.minMarks, contestSelection.optionSelections.length, markingType.maxMarks) ){
    throw new CorruptSelectionError('Contest selection does not contain a valid amount of option selections')
  }

  // Validate duplicates - that any vote selection is not referencing the same option multiple times
  const selectedOptions = contestSelection.optionSelections.map(os => os.reference)
  if( hasDuplicates(selectedOptions) ){
    throw new CorruptSelectionError('Same option selected multiple times')
  }

  const getOption = makeGetOption(options)

  contestSelection.optionSelections.forEach(optionSelection => {
    const option = getOption(optionSelection)

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

function validateContestsMatching( ballotConfig: BallotConfig, ballotSelection: BallotSelection ){
  const selectedContests = ballotSelection.contestSelections.map(cs => cs.reference)
  if( !containsSameStrings(ballotConfig.content.contestReferences, selectedContests) ){
    throw new CorruptSelectionError('Contest selections do not match the contests allowed by the ballot')
  }
}

function makeGetOption(options: Option[]){
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

function hasDuplicates(arr: string[]) {
  const seen = {}
  return arr.some(str => {
    if( seen[str] ) return true
    seen[str] = true
  })
}

function containsSameStrings( array1: string[], array2: string[] ){
  const cloned1 = [...array1]
  const cloned2 = [...array2]
  
  cloned1.sort()
  cloned2.sort()

  return JSON.stringify(cloned1) === JSON.stringify(cloned2)
}
