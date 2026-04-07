import { ContestContent, OptionSelection, OptionContent, SelectionPile, Error } from "../av_client/types";

function choicesExceedCredits(optionSelections: Array<OptionSelection>, credits: number) {
  const counts = new Map<string, number>();
  let usedCredits: number = 0;

  for (const selection of optionSelections) {
    counts.set(selection.reference, (counts.get(selection.reference) ?? 0) + 1);
  }

  for (const count of counts.values()) {
    for (let n = 1; n <= count; n++) {
      usedCredits += n * n;
    }
  }

  return usedCredits > credits;
};

function tooManySelections(optionSelections: Array<OptionSelection>, contest: ContestContent) {
  if (!contest.markingType.quadraticVoting) return optionSelections.length > contest.markingType.maxMarks;
  return choicesExceedCredits(optionSelections, contest.markingType.quadraticVotingVoiceCredits || 0);
}

function withinBounds(optionSelections: Array<OptionSelection>, contest: ContestContent, isBlank?: boolean, isExclusive?: boolean) {
  const calculatedMinMarks = !isBlank && isExclusive ? 1 : contest.markingType.minMarks;
  return calculatedMinMarks <= optionSelections.length && !tooManySelections(optionSelections, contest);
}

export { choicesExceedCredits, tooManySelections, withinBounds };
