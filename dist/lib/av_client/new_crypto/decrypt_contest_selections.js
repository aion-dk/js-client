"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptContestSelections = void 0;
var aion_crypto_1 = require("./../aion_crypto");
var byte_encoding_1 = require("../encoding/byte_encoding");
var av_crypto_1 = require("../../av_crypto");
function decryptContestSelections(contestConfigs, encryptionKey, contests, boardCommitmentOpening, voterCommitmentOpening) {
    var contestSelections = Object.entries(contests).map(function (_a) {
        var contestReference = _a[0], piles = _a[1];
        var crypto = new av_crypto_1.AVCrypto("secp256k1");
        var contestConfig = contestConfigs[contestReference];
        var maxSize = contestConfig.content.markingType.encoding.maxSize;
        var otherPiles = piles.map(function (sealedPile, index) {
            var pileCryptograms = sealedPile.cryptograms;
            var pileMultiplier = sealedPile.multiplier;
            var randomizers = combineRandomizers(contestReference, index, boardCommitmentOpening, voterCommitmentOpening);
            var bytes = crypto.revertEncryption(pileCryptograms, randomizers, encryptionKey);
            var encodedContestSelection = bytes.slice(0, maxSize);
            console.log("AV_CRYPTO_REVERT_ENCRYPTION_CALLED!");
            return (0, byte_encoding_1.byteArrayToSelectionPile)(contestConfig, encodedContestSelection, pileMultiplier);
        });
        return {
            reference: contestReference,
            piles: otherPiles
        };
    });
    return contestSelections;
}
exports.decryptContestSelections = decryptContestSelections;
function combineRandomizers(contestReference, index, boardCommitmentOpening, voterCommitmentOpening) {
    var br = boardCommitmentOpening.randomizers[contestReference][index];
    var vr = voterCommitmentOpening.randomizers[contestReference][index];
    return Object.keys(vr).map(function (i) { return (0, aion_crypto_1.addBigNums)(vr[i], br[i]); });
}
//# sourceMappingURL=decrypt_contest_selections.js.map