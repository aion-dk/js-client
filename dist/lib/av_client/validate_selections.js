"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateContestSelection = exports.validateBallotSelection = void 0;
var flatten_options_1 = require("./flatten_options");
var errors_1 = require("./errors");
function validateBallotSelection(ballotConfig, contestConfigs, ballotSelection, votingRoundConfig, weight) {
    if (ballotConfig.content.reference !== ballotSelection.reference) {
        throw new errors_1.CorruptSelectionError('Ballot selection does not match ballot config');
    }
    validateContestsMatching(ballotConfig, ballotSelection, votingRoundConfig);
    ballotSelection.contestSelections.forEach(function (contestSelection) {
        var contestConfig = getContestConfig(contestConfigs, contestSelection);
        validateContestSelection(contestConfig, contestSelection, weight);
    });
}
exports.validateBallotSelection = validateBallotSelection;
function validateContestSelection(contestConfig, contestSelection, weight) {
    if (contestConfig.content.reference !== contestSelection.reference) {
        throw new errors_1.CorruptSelectionError('Contest selection is not matching contest config');
    }
    var _a = contestConfig.content, markingType = _a.markingType, options = _a.options;
    // Validate maxPiles allowed
    if (markingType.maxPiles && markingType.maxPiles > contestSelection.piles.length) {
        throw new errors_1.CorruptSelectionError('Weight is distributed more than allowed.');
    }
    // Validate weight versus pile multipliers
    if (weight < contestSelection.piles.reduce(function (sum, pile) { return sum + pile.multiplier; }, 0)) {
        throw new errors_1.CorruptSelectionError('Selection sum is larger than voting weight.');
    }
    contestSelection.piles.forEach(function (pile) { return validateSelectionPile(pile, markingType, options); });
}
exports.validateContestSelection = validateContestSelection;
function validateSelectionPile(pile, markingType, options) {
    var isBlank = pile.optionSelections.length === 0;
    // Validate blankSubmission
    if (isBlank && markingType.blankSubmission == 'disabled') {
        throw new errors_1.CorruptSelectionError('Blank submissions are not allowed in this contest');
    }
    // Validate that mark count is within bounds
    if (!isBlank && !withinBounds(markingType.minMarks, pile.optionSelections.length, markingType.maxMarks)) {
        throw new errors_1.CorruptSelectionError('Contest selection does not contain a valid amount of option selections');
    }
    // Validate duplicates - that any vote selection is not referencing the same option multiple times
    var selectedOptions = pile.optionSelections.map(function (os) { return os.reference; });
    if (hasDuplicates(selectedOptions)) {
        throw new errors_1.CorruptSelectionError('Same option selected multiple times');
    }
    var getOption = makeGetOption(options);
    pile.optionSelections.forEach(function (optionSelection) {
        var option = getOption(optionSelection);
        if (option.writeIn) {
            if (!optionSelection.text) {
                throw new errors_1.CorruptSelectionError('Expected write in text missing for option selection');
            }
            var textByteSize = new TextEncoder().encode(optionSelection.text).length;
            if (option.writeIn.maxSize < textByteSize) {
                throw new errors_1.CorruptSelectionError('Max size exceeded for write in text');
            }
        }
    });
}
function getContestConfig(contestConfigs, contestSelection) {
    var contestConfig = contestConfigs[contestSelection.reference];
    if (contestConfig)
        return contestConfig;
    throw new errors_1.CorruptSelectionError('Contest config not found');
}
function validateContestsMatching(ballotConfig, ballotSelection, votingRoundConfig) {
    var availableContests = votingRoundConfig.content.contestReferences.filter(function (value) { return ballotConfig.content.contestReferences.includes(value); });
    var selectedContests = ballotSelection.contestSelections.map(function (cs) { return cs.reference; });
    if (!containsSameStrings(availableContests, selectedContests)) {
        throw new errors_1.CorruptSelectionError('Contest selections do not match the contests allowed by the ballot or voting round');
    }
}
function makeGetOption(options) {
    var flatOptions = (0, flatten_options_1.flattenOptions)(options);
    var referenceMap = Object.fromEntries(flatOptions.map(function (o) { return [o.reference, o]; }));
    return function (optionSelection) {
        var option = referenceMap[optionSelection.reference];
        if (option)
            return option;
        throw new errors_1.CorruptSelectionError('Option config not found');
    };
}
function withinBounds(min, n, max) {
    return min <= n && n <= max;
}
function hasDuplicates(arr) {
    var seen = {};
    return arr.some(function (str) {
        if (seen[str])
            return true;
        seen[str] = true;
    });
}
function containsSameStrings(array1, array2) {
    var cloned1 = __spreadArray([], array1, true);
    var cloned2 = __spreadArray([], array2, true);
    cloned1.sort();
    cloned2.sort();
    return JSON.stringify(cloned1) === JSON.stringify(cloned2);
}
//# sourceMappingURL=validate_selections.js.map