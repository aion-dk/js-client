import { ContestSelection, OptionSelection } from "../av_client/types";
import { CVRRoot, CVRContestSelection, CVRContest } from "./nist_cvr_types";

export function extractContestSelections(cvrJson): ContestSelection[] {
  const contests = extractContestsJson(cvrJson as CVRRoot)

  return contests.map(contest => {
    return {
      reference: contest.ContestId,
      optionSelections: extractOptionSelections(contest.CVRContestSelection)
    }
  })
}

function extractOptionSelections(nistContestSelection: CVRContestSelection[]): OptionSelection[] {
  const nistSelected = nistContestSelection.filter(nistOptionSelection => {
    const nistSelectionPositions = nistOptionSelection.SelectionPosition
    if( nistSelectionPositions.length != 1 ) throw Error('Unexpected CVR structure. Expected exactly one SelectionPosition')

    return nistSelectionPositions[0].NumberVotes > 0
  })

  return nistSelected.map(nistOptionSelection => {
    const nistSelectionPosition = nistOptionSelection.SelectionPosition[0]
    const optionReference = nistOptionSelection.ContestSelectionId
    const writeIn = nistSelectionPosition.CVRWriteIn
    if( writeIn ){
      return { reference: optionReference, text: writeIn.Text as string } as OptionSelection
    } else {
      return { reference: optionReference } as OptionSelection
    }
  })
}

function extractContestsJson(cvrJson: CVRRoot): CVRContest[] {
  const cvrs = cvrJson.CVR
  if( cvrs.length != 1 ) throw Error('Unexpected CVR structure. Expected exactly one CVR')

  const snapshots = cvrs[0].CVRSnapshot
  if( snapshots.length != 1 ) throw Error('Unexpected CVR structure. Expected exactly one CVRSnapshot')

  return snapshots[0].CVRContest
}
