import { ContestContent, OptionSelection, OptionContent, SelectionPile } from '../av_client/types';

class SelectionPileValidator {
  private contest: ContestContent;
  constructor(contest: ContestContent) {
    this.contest = contest;
  }

  validate(selectionPile: SelectionPile): string[] {
    const errors: string[] = [];

    if (this.referenceMissing(selectionPile.optionSelections)) errors.push('invalid_reference');
    if (this.tooManySelections(selectionPile.optionSelections)) errors.push('too_many');
    if (this.blankNotAlone(selectionPile.optionSelections, selectionPile.explicitBlank)) errors.push('blank');
    if (this.exclusiveNotAlone(selectionPile.optionSelections)) errors.push('exclusive');

    return errors;
  }

  isComplete(selectionPile: SelectionPile) {
    const enoughVotes =
      selectionPile.explicitBlank ||
      this.implicitlyBlank(selectionPile.optionSelections) ||
      !this.tooFewSelections(selectionPile.optionSelections);
    return enoughVotes && this.validate(selectionPile).length == 0;
  }

  private get optionReferences() {
    return this.recursiveFlattener(this.contest.options as OptionContent[]).map((option) => option.reference);
  }

  private recursiveFlattener(options: OptionContent[] | null): OptionContent[] {
    if (!options) return [];
    const response = options.flatMap((option) => option.children ? [option, ...this.recursiveFlattener(option.children)] : [option]);
    return response;
  }

  private selectedReferences(optionSelections: OptionSelection[]) {
    return optionSelections.map((os) => os.reference);
  }

  private referenceMissing(choices: OptionSelection[]) {
    return !this.selectedReferences(choices).every(
      (choice) => choice === 'blank' || this.optionReferences.includes(choice),
    );
  }

  private implicitlyBlank(choices: OptionSelection[]) {
    return this.contest.markingType.blankSubmission === 'implicit' && choices.length === 0;
  }
  private tooFewSelections(choices: OptionSelection[]) {
    return choices.length < this.contest.markingType.minMarks;
  }
  private tooManySelections(choices: OptionSelection[]) {
    if (this.contest.markingType.votesAllowedPerOption) {
      return (
        choices.length > this.contest.markingType.maxMarks &&
        choices.length > this.contest.markingType.votesAllowedPerOption
      );
    }
  }
  private exclusiveNotAlone(choices: OptionSelection[]) {
    if (this.selectedReferences(choices).length < 2) return false;

    const options = this.recursiveFlattener(this.contest.options as OptionContent[]);
    return this.selectedReferences(choices)
      .map((ref) => options.find((option) => option.reference === ref))
      .some((option) => option?.exclusive === true);
  }
  private blankNotAlone(choices: OptionSelection[], explicitlyBlank: boolean | undefined) {
    return choices.length > 0 && explicitlyBlank;
  }
}

export default SelectionPileValidator;