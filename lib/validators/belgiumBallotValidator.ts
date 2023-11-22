import { ContestContent, OptionSelection, SelectionPile } from '../av_client/types';

class BelgiumBallotValidator {
  private contest: ContestContent;
  constructor(contest: ContestContent) {
    this.contest = contest;
  }

  validate(selectionPile: SelectionPile): string[] {
    const errors: string[] = [];

    if (this.partyExclusive(selectionPile.optionSelections)) errors.push('cross_party_voting');
    if (this.parentExclusive(selectionPile.optionSelections)) errors.push('parent_and_child_selected');

    return errors
  }

  private selectedReferences(optionSelections: OptionSelection[]) {
    return optionSelections.map((os) => os.reference);
  }

  isComplete(selectionPile: SelectionPile) {
    return this.validate(selectionPile).length == 0;
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

  /**
   * Not allowed to vote on a parent and child
   */
  private parentExclusive(choices: OptionSelection[]) {
    const selectedReferences = this.selectedReferences(choices)
    let error = false

    const selectedParents = this.contest.options.filter(option => selectedReferences.includes(option.reference))
    if (!selectedParents.length) return

    selectedParents.forEach(parent =>  {

      if (!parent.children) return

      if (parent.children.find(child => selectedReferences.includes(child.reference))) error = true
    })

    return error
  }
}

export default BelgiumBallotValidator;
