import { ContestContent, OptionSelection, OptionContent } from "../av_client/types";

function choicesExceedCredits(optionSelections: Array<OptionSelection>, credits: number): boolean {
  const counts = new Map<string, number>();
  let usedCredits: number = 0;

  for (const selection of optionSelections) {
    counts.set(selection.reference, (counts.get(selection.reference) ?? 0) + 1);
  }

  for (const count of counts.values()) {
    usedCredits += count * count;
  }

  return usedCredits > credits;
};

function tooManySelections(optionSelections: Array<OptionSelection>, contest: ContestContent): boolean {
  if (!contest.markingType.quadraticVoting) return optionSelections.length > contest.markingType.maxMarks;
  return choicesExceedCredits(optionSelections, contest.markingType.quadraticVotingVoiceCredits || 0);
}

function withinBounds(optionSelections: Array<OptionSelection>, contest: ContestContent, isBlank?: boolean, isExclusive?: boolean): boolean {
  const calculatedMinMarks = !isBlank && isExclusive ? 1 : contest.markingType.minMarks;
  return calculatedMinMarks <= optionSelections.length && !tooManySelections(optionSelections, contest);
}

function writeInNotPresent(optionSelection: OptionSelection): boolean {
  return !optionSelection.text || new Blob([optionSelection.text]).size === 0;
}

function writeInTooLong(optionSelection: OptionSelection, optionContent: OptionContent): boolean {
  const textByteSize = new Blob([optionSelection.text as string]).size;
  return Number(optionContent.writeIn?.maxSize || 0) < textByteSize;
}

function writeInContentNotSupported(optionSelection: OptionSelection): boolean {
    /**
     * \p{L} - All letters from any language
     * \p{N} - Numbers
     * \p{Z} - Whitespace separators
     * ,.?!  - Any extra symbols we want to accept
     */
    const regexp = /[^\p{L}\p{N}\p{Z},.'‘()?!@€£¥\n]/gu;
    return regexp.test(optionSelection.text as string);
}

function writeInEmpty(optionSelection: OptionSelection): boolean {
  return !(optionSelection.text as string).trim().length;
}

export {
  choicesExceedCredits,
  tooManySelections,
  withinBounds,
  writeInNotPresent,
  writeInTooLong,
  writeInContentNotSupported,
  writeInEmpty
};
