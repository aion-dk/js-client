"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var convert = require("xml-js");
function nistCvrToAvCvr(xml) {
    var castVoteRecordReport;
    try {
        var content = xmlToJson(xml);
        castVoteRecordReport = content.CastVoteRecordReport;
    }
    catch (error) {
        throw new Error('Failure converting malformed NIST CVR');
    }
    if (castVoteRecordReport === undefined)
        throw new Error('Failure converting empty NIST CVR');
    var snapshot = getCurrentSnapshot(castVoteRecordReport.CVR);
    var contests = getContests(snapshot);
    var result = contests.reduce(combineSelectionsToMap, {});
    return result;
}
// Helpers
function xmlToJson(xml) {
    var parseOptions = {
        compact: true,
        spaces: 4,
        textKey: 'text'
    };
    return JSON.parse(convert.xml2json(xml, parseOptions));
}
function getCurrentSnapshot(cvr) {
    if (Array.isArray(cvr.CVRSnapshot)) {
        var current = cvr.CVRSnapshot
            .find(function (s) { return s._attributes.ObjectId === cvr.CurrentSnapshotId.text; });
        if (current === undefined)
            throw new Error('No CVRSnapshot found');
        return current;
    }
    return cvr.CVRSnapshot;
}
function getContests(snapshot) {
    if (Array.isArray(snapshot.CVRContest)) {
        return snapshot.CVRContest;
    }
    if (snapshot.CVRContest === undefined) {
        throw new Error('No CVRContest found');
    }
    return [snapshot.CVRContest];
}
function combineSelectionsToMap(acc, current) {
    var _a;
    if (Array.isArray(current.CVRContestSelection)) {
        throw new Error('No support for multiple selections for a single contest (multiple or ranked)');
    }
    if (current.CVRContestSelection === undefined) {
        throw new Error('No CVRContestSelection found');
    }
    return __assign(__assign({}, acc), (_a = {}, _a[current.ContestId.text] = current.CVRContestSelection.ContestSelectionId.text, _a));
}
exports.default = {
    nistCvrToAvCvr: nistCvrToAvCvr
};
//# sourceMappingURL=nist_converter.js.map