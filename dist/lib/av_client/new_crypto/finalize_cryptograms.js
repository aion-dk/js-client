"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.finalizeCryptograms = void 0;
var av_crypto_1 = require("../../av_crypto");
function finalizeCryptograms(contestEnvelopes, serverCryptograms) {
    var entries = contestEnvelopes.map(function (ce) {
        var finalizedCryptograms = ce.piles.map(function (p, index) {
            return {
                multiplier: p.multiplier,
                cryptograms: addCryptograms(p.cryptograms, serverCryptograms[ce.reference][index])
            };
        });
        return [ce.reference, finalizedCryptograms];
    });
    return Object.fromEntries(entries);
}
exports.finalizeCryptograms = finalizeCryptograms;
function addCryptograms(list1, list2) {
    var crypto = new av_crypto_1.AVCrypto("secp256k1");
    return list1.map(function (cryptogram, i) {
        var finalCryptogram = crypto.combineCryptograms(cryptogram, list2[i]);
        console.log("AV_CRYPTO_COMBINE_CRYPTOGRAMS_CALLED!");
        return finalCryptogram;
    });
}
//# sourceMappingURL=finalize_cryptograms.js.map