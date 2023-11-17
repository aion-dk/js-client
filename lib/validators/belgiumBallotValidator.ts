import { ContestContent, OptionSelection, OptionContent, SelectionPile } from '../av_client/types';

class BelgiumBallotValidator {
  private contest: ContestContent;
  constructor(contest: ContestContent) {
    this.contest = contest;
  }

  validate(selectionPile: SelectionPile): string[] {
    const errors: string[] = [];

    console.log("Validating Belgium Ballot");

    if (this.tooManyInParty(selectionPile.optionSelections)) errors.push('too_many_in_party');
    if (this.partyExclusive(selectionPile.optionSelections)) errors.push('cross_party_voting');
    if (this.parentExclusive(selectionPile.optionSelections)) errors.push('parent_and_child_selected');

    return errors
  }

  private selectedReferences(optionSelections: OptionSelection[]) {
    return optionSelections.map((os) => os.reference);
  }

  /**
   * Not allowed to vote in more than 50% of the candidates in the party
   */
  private tooManyInParty(choices: OptionSelection[]) {
    let selectedReferences = this.selectedReferences(choices)
    let error = false

    this.contest.options.forEach(parent =>  {
      if (!parent.children) return

      let selectedInParty = parent.children.filter(child => selectedReferences.includes(child.reference))

      if (selectedInParty.length > parent.children.length / 2) {
        error = true
      }
    })

    return error
  }

  /**
   * Not allowed to vote across parties
   */
  private partyExclusive(choices: OptionSelection[]) {
    let selectedReferences = this.selectedReferences(choices)
    let error = this.contest.options.filter(option => selectedReferences.includes(option.reference)).length > 1

    let found = false
    this.contest.options.forEach(parent =>  {
      if (!parent.children) return

      let childChosen = parent.children.some(child => selectedReferences.includes(child.reference))
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
    let selectedReferences = this.selectedReferences(choices)
    let error = false

    let selectedParents = this.contest.options.filter(option => selectedReferences.includes(option.reference))
    if (!selectedParents.length) return

    selectedParents.forEach(parent =>  {

      if (!parent.children) return

      if (parent.children.find(child => selectedReferences.includes(child.reference))) error = true
    })

    return error
  }
}

export default BelgiumBallotValidator;
