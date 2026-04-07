import { ContestContent, OptionSelection, OptionContent } from "../av_client/types";

function choicesExceedCredits(optionSelections: Array<OptionSelection>, credits: number): boolean {
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

function tooManySelections(optionSelections: Array<OptionSelection>, contest: ContestContent): boolean {
  if (!contest.markingType.quadraticVoting) return optionSelections.length > contest.markingType.maxMarks;
  return choicesExceedCredits(optionSelections, contest.markingType.quadraticVotingVoiceCredits || 0);
}

function withinBounds(optionSelections: Array<OptionSelection>, contest: ContestContent, isBlank?: boolean, isExclusive?: boolean): boolean {
  const calculatedMinMarks = !isBlank && isExclusive ? 1 : contest.markingType.minMarks;
  return calculatedMinMarks <= optionSelections.length && !tooManySelections(optionSelections, contest);
}

function writeInValidation(optionSelection: OptionSelection, optionContent: OptionContent): string | void {
  if (!optionSelection.text || new Blob([optionSelection.text]).size < 0) return "write_in_required";

  const textByteSize = new Blob([optionSelection.text]).size;
  if (optionContent.writeIn?.maxSize || 0 < textByteSize) return "write_in_too_long";

  if (optionSelection.text) {
    /**
     * \p{L} - All letters from any language
     * \p{N} - Numbers
     * \p{Z} - Whitespace separators
     * ,.?!  - Any extra symbols we want to accept
     */
    const regexp = /[^\p{L}\p{N}\p{Z},.'‘()?!@€£¥\n]/gu;
    if (regexp.test(optionSelection.text)) return "write_in_not_supported";
    if (!optionSelection.text.trim().length) return "write_in_empty";
  }
}

export { choicesExceedCredits, tooManySelections, withinBounds, writeInValidation };
