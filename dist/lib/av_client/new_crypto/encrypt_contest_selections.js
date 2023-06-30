"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptContestSelections = void 0;
var byte_encoding_1 = require("../encoding/byte_encoding");
var av_crypto_1 = require("../../av_crypto");
function encryptContestSelections(contestConfigs, contestSelections, encryptionKey) {
    return contestSelections.map(function (contestSelection) {
        var contestConfig = contestConfigs[contestSelection.reference];
        return encryptContestSelection(contestConfig, contestSelection, encryptionKey);
    });
}
exports.encryptContestSelections = encryptContestSelections;
function encryptContestSelection(contestConfig, contestSelection, encryptionKey) {
    if (contestConfig.content.reference !== contestSelection.reference) {
        throw new Error("contest selection does not match contest");
    }
    var encryptedPiles = contestSelection.piles.map(function (sp) {
        return encryptSelectionPile(contestConfig, sp, encryptionKey);
    });
    return {
        reference: contestSelection.reference,
        piles: encryptedPiles,
    };
}
function encryptSelectionPile(contestConfig, selectionPile, encryptionKey) {
    var crypto = new av_crypto_1.AVCrypto("secp256k1");
    var encodedSelectionPile = (0, byte_encoding_1.selectionPileToByteArray)(contestConfig, selectionPile);
    var _a = crypto.encryptVote(encodedSelectionPile, encryptionKey), cryptograms = _a.cryptograms, randomizers = _a.randomizers;
    console.log("AV_CRYPTO_ENCRYPT_VOTE_CALLED!");
    return {
        multiplier: selectionPile.multiplier,
        cryptograms: cryptograms,
        randomizers: randomizers
    };
}
//# sourceMappingURL=encrypt_contest_selections.js.map