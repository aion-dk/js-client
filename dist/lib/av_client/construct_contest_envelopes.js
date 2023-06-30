"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.constructContestEnvelopes = void 0;
var validate_selections_1 = require("./validate_selections");
var errors_1 = require("./errors");
var commitments_1 = require("./new_crypto/commitments");
var encrypt_contest_selections_1 = require("./new_crypto/encrypt_contest_selections");
function constructContestEnvelopes(state, ballotSelection) {
    var _a = extractConfig(state), contestConfigs = _a.contestConfigs, ballotConfig = _a.ballotConfig, encryptionKey = _a.encryptionKey, votingRoundConfig = _a.votingRoundConfig, weight = _a.weight;
    (0, validate_selections_1.validateBallotSelection)(ballotConfig, contestConfigs, ballotSelection, votingRoundConfig, weight);
    var contestEnvelopes = (0, encrypt_contest_selections_1.encryptContestSelections)(contestConfigs, ballotSelection.contestSelections, encryptionKey);
    var envelopeRandomizers = extractRandomizers(contestEnvelopes);
    var pedersenCommitment = (0, commitments_1.generateCommitment)(envelopeRandomizers);
    return {
        pedersenCommitment: pedersenCommitment,
        envelopeRandomizers: envelopeRandomizers,
        contestEnvelopes: contestEnvelopes,
    };
}
exports.constructContestEnvelopes = constructContestEnvelopes;
function extractRandomizers(contestEnvelopes) {
    var randomizers = function (ce) { return ce.piles.map(function (p) {
        return p.randomizers;
    }); };
    var entries = contestEnvelopes.map(function (ce) { return [ce.reference, randomizers(ce)]; });
    return Object.fromEntries(entries);
}
function extractConfig(state) {
    var _a = state.voterSession.content, voterGroup = _a.voterGroup, weight = _a.weight;
    var _b = state.latestConfig.items, contestConfigs = _b.contestConfigs, ballotConfigs = _b.ballotConfigs, votingRoundConfigs = _b.votingRoundConfigs;
    var encryptionKey = state.latestConfig.items.thresholdConfig.content.encryptionKey;
    var ballotConfig = ballotConfigs[voterGroup];
    var votingRoundConfig = votingRoundConfigs[state.votingRoundReference];
    if (!ballotConfig) {
        throw new errors_1.InvalidStateError('Cannot construct ballot cryptograms. Ballot config not found for voter');
    }
    return {
        ballotConfig: ballotConfig,
        contestConfigs: contestConfigs,
        encryptionKey: encryptionKey,
        votingRoundConfig: votingRoundConfig,
        weight: weight,
    };
}
//# sourceMappingURL=construct_contest_envelopes.js.map