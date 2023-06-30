"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractContestSelections = void 0;
function extractContestSelections(cvrJson) {
    var contests = extractContestsJson(cvrJson);
    return contests.map(function (contest) {
        return {
            reference: contest.ContestId,
            piles: [
                {
                    multiplier: 1,
                    optionSelections: extractOptionSelections(contest.CVRContestSelection)
                }
            ]
        };
    });
}
exports.extractContestSelections = extractContestSelections;
function extractOptionSelections(nistContestSelection) {
    var nistSelected = nistContestSelection.filter(function (nistOptionSelection) {
        var nistSelectionPositions = nistOptionSelection.SelectionPosition;
        if (nistSelectionPositions.length != 1)
            throw Error('Unexpected CVR structure. Expected exactly one SelectionPosition');
        return nistSelectionPositions[0].NumberVotes > 0;
    });
    return nistSelected.map(function (nistOptionSelection) {
        var nistSelectionPosition = nistOptionSelection.SelectionPosition[0];
        var optionReference = nistOptionSelection.ContestSelectionId;
        var writeIn = nistSelectionPosition.CVRWriteIn;
        if (writeIn) {
            return { reference: optionReference, text: writeIn.Text };
        }
        else {
            return { reference: optionReference };
        }
    });
}
function extractContestsJson(cvrJson) {
    var cvrs = cvrJson.CVR;
    if (cvrs.length != 1)
        throw Error('Unexpected CVR structure. Expected exactly one CVR');
    var snapshots = cvrs[0].CVRSnapshot;
    if (snapshots.length != 1)
        throw Error('Unexpected CVR structure. Expected exactly one CVRSnapshot');
    return snapshots[0].CVRContest;
}
//# sourceMappingURL=nist_cvr_extractor.js.map