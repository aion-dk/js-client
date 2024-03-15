import { ContestContent, ContestSelection, Error } from '../av_client/types';
import SelectionPileValidator from './selectionPileValidator';

export default class ContestSelectionValidator {
  private readonly contest: ContestContent;
  private readonly voterWeight: number;

  constructor({ contest, voterWeight }: { contest: ContestContent; voterWeight: number }) {
    this.contest = contest;
    this.voterWeight = voterWeight;
  }

  isComplete(contestSelection: ContestSelection) {
    return this.allWeightUsed(contestSelection) && this.validate(contestSelection).length == 0;
  }

  validate(contestSelection: ContestSelection): Error[] {
    let errors: Error[] = [];
    const selectionPileValidator = new SelectionPileValidator(this.contest);

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
