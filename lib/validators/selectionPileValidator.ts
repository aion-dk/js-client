import { ContestContent, OptionSelection, OptionContent, SelectionPile, Error } from '../av_client/types';

class SelectionPileValidator {
  private contest: ContestContent;
  constructor(contest: ContestContent) {
    this.contest = contest;
  }

  validate(selectionPile: SelectionPile, includeLazyErrors = false): Error[] {
    const errors: Error[] = [];

    if (this.referenceMissing(selectionPile.optionSelections)) errors.push({ message: 'invalid_reference'});
    if (this.tooManySelections(selectionPile.optionSelections)) errors.push({ message: 'too_many'});
    if (this.blankNotAlone(selectionPile.optionSelections, selectionPile.explicitBlank)) errors.push({message: 'blank'});
    if (this.exclusiveNotAlone(selectionPile.optionSelections)) errors.push({ message: 'exclusive' });

    errors.push(...this.exceededListVotes(selectionPile.optionSelections))

    if (selectionPile.explicitBlank || this.implicitlyBlank(selectionPile.optionSelections)) return errors

    if (includeLazyErrors) {
      errors.push(...this.belowMinListVotes(selectionPile.optionSelections))
    }

    return errors;
  }

  isComplete(selectionPile: SelectionPile) {
    const enoughVotes =
      selectionPile.explicitBlank ||
      this.optionIsExclusive(selectionPile) ||
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
    return choices.length > this.contest.markingType.maxMarks;
  }

  private belowMinListVotes(choices: OptionSelection[]) {
    const options = this.recursiveFlattener(this.contest.options as OptionContent[]);

    const optionsWithListLimit = options.map((op) => op?.minChooseableSuboptions ? op : null)

    const errors: Error[] = []

    optionsWithListLimit.forEach(op => {
      if (op?.minChooseableSuboptions && this.selectedChildren(choices, [op]) < op.minChooseableSuboptions) {
        errors.push({message: "below_list_limit", keys: { list_name: op.title, min_list_marks: op.minChooseableSuboptions }})
      }
    })

    return errors
  }

  private exceededListVotes(choices: OptionSelection[]) {
    const options = this.recursiveFlattener(this.contest.options as OptionContent[]);

    const optionsWithListLimit = options.map((op) => op?.maxChooseableSuboptions ? op : null)

    const errors: Error[] = []

    optionsWithListLimit.forEach(op => {
      if (op?.maxChooseableSuboptions && this.selectedChildren(choices, [op]) > op.maxChooseableSuboptions) {
        errors.push({message: "exceeded_list_limit", keys: { list_name: op.title, max_list_marks: op.maxChooseableSuboptions }})
      }
    })

    return errors
  }

  private selectedChildren(choices: OptionSelection[], options?: OptionContent[], count = 0): number {
    if (!options) return count

    options.forEach(op => {
      const childrenSelected = op?.children?.filter(child => this.selectedReferences(choices).includes(child.reference))

      count += childrenSelected?.length || 0

      if (op.children) {
        count = this.selectedChildren(choices, op.children, count)
      }
    })

    return count
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

  private optionIsExclusive(selectionPile: SelectionPile) {
    return selectionPile.optionSelections?.length === 1 &&
      this.contest.options.find(option => option.reference === selectionPile.optionSelections[0].reference)?.exclusive;
  }
}

export default SelectionPileValidator;
