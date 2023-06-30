"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCommitment = exports.generateCommitment = void 0;
var av_crypto_1 = require("../../av_crypto");
var utils_1 = require("../../av_crypto/utils");
function generateCommitment(randomizersMap) {
    var crypto = new av_crypto_1.AVCrypto("secp256k1");
    var randomizers = flattenRandomizers(randomizersMap);
    var context = concatContext(randomizersMap);
    var commitment = crypto.commit(randomizers, context);
    console.log("AV_CRYPTO_COMMIT_CALLED!");
    return {
        commitment: commitment.commitment,
        randomizer: commitment.privateCommitmentRandomizer,
    };
}
exports.generateCommitment = generateCommitment;
function validateCommitment(commitmentOpening, commitment, customErrorMessage) {
    var crypto = new av_crypto_1.AVCrypto("secp256k1");
    var encryptionRandomizers = flattenRandomizers(commitmentOpening.randomizers);
    var context = concatContext(commitmentOpening.randomizers);
    var valid = crypto.isValidCommitment(commitment, commitmentOpening.commitmentRandomness, encryptionRandomizers, context);
    console.log("AV_CRYPTO_IS_VALID_COMMITMENT_CALLED!");
    if (!valid) {
        throw new Error(customErrorMessage || 'Pedersen commitment not valid');
    }
}
exports.validateCommitment = validateCommitment;
function flattenRandomizers(randomizersMap) {
    var iterator = Object.entries(randomizersMap);
    return iterator.map(function (_a) {
        var _ = _a[0], matrix = _a[1];
        return matrix;
    }).flat(2);
}
function concatContext(randomizersMap) {
    var iterator = Object.entries(randomizersMap);
    return (0, utils_1.concatForHashing)(iterator.map(function (_a) {
        var reference = _a[0], _ = _a[1];
        return reference;
    }));
}
//# sourceMappingURL=commitments.js.map