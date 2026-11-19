import { ContestContent, ContestSelection, Error } from '../av_client/types';
import SelectionPileValidator from './selectionPileValidator';

type ContestSelectionValidatorOptions = {
  selfVotePrevention?: boolean;
  voterIdentifier?: string;
};

export default class ContestSelectionValidator {
  private readonly contest: ContestContent;
  private readonly voterWeight: number;
  private readonly options: ContestSelectionValidatorOptions;

  constructor({ contest, voterWeight, ...options }: { contest: ContestContent; voterWeight: number } & ContestSelectionValidatorOptions) {
    this.contest = contest;
    this.voterWeight = voterWeight;
    this.options = options;
  }

  isComplete(contestSelection: ContestSelection) {
    return this.allWeightUsed(contestSelection) && this.validate(contestSelection).length == 0;
  }

  validate(contestSelection: ContestSelection): Error[] {
    let errors: Error[] = [];
    const selectionPileValidator = new SelectionPileValidator(this.contest, this.options);

    contestSelection.piles.forEach((pile) => {
      errors = [...errors, ...selectionPileValidator.validate(pile)];
    });

    contestSelection.piles.forEach((pile) => {
      if (!selectionPileValidator.isComplete(pile)) errors.push({ message: 'A selection is not complete' });
    });

    return errors;
  }

  private allWeightUsed(contestSelection: ContestSelection) {
    return this.voterWeight === contestSelection.piles.reduce((sum, pile) => pile.multiplier + sum, 0);
  }
}
