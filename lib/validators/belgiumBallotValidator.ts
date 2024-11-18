import { ContestContent, OptionSelection, SelectionPile } from '../av_client/types';
import { Error } from "../av_client/types"

class BelgiumBallotValidator {
  private contest: ContestContent;
  constructor(contest: ContestContent) {
    this.contest = contest;
  }

  validate(selectionPile: SelectionPile): Error[] {
    const errors: Error[] = [];

    if (this.partyExclusive(selectionPile.optionSelections)) errors.push({ message: 'cross_party_voting' });

    return errors
  }

  private selectedReferences(optionSelections: OptionSelection[]) {
    return optionSelections.map((os) => os.reference);
  }

  /**
   * Not allowed to vote across parties
   */
  private partyExclusive(choices: OptionSelection[]) {
    const selectedReferences = this.selectedReferences(choices)

    // Cannot vote on two parties at once
    let error = this.contest.options.filter(option => selectedReferences.includes(option.reference)).length > 1

    let found = false
    this.contest.options.forEach(parent =>  {
      // Cannot vote for a party and a child in another party
      if (selectedReferences.includes(parent.reference)) {
        const remainingReferences = selectedReferences.filter(reference => reference !== parent.reference)
        const childReferences = parent.children?.map(child => child.reference)

        error = remainingReferences.some(reference => !childReferences?.includes(reference))
      }

      // Cannot vote for children in two different parties
      const childChosen = parent.children?.some(child => selectedReferences.includes(child.reference))
      if(found && childChosen) {
        error = true
      } else if(childChosen) {
        found = true
      }
    })

    return error
  }
}

export default BelgiumBallotValidator;
