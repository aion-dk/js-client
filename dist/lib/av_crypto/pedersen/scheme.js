"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commit = exports.isValid = void 0;
var utils_1 = require("../utils");
var commitment_1 = require("./commitment");
function isValid(commitment, messages, context, curve) {
    if (context === void 0) { context = ""; }
    if (!commitment.isOpenable()) {
        throw new Error("commitment must be openable");
    }
    var recomputedCommitment = commit(messages, context, curve, (0, utils_1.generateKeyPair)(curve, commitment.r));
    return (0, utils_1.pointEquals)(commitment.c, recomputedCommitment.c);
}
exports.isValid = isValid;
function commit(messages, context, curve, randomness) {
    if (context === void 0) { context = ""; }
    if (randomness === void 0) { randomness = (0, utils_1.generateKeyPair)(curve); }
    if (!Array.isArray(messages)) {
        messages = [messages];
    }
    messages = messages;
    var points = messages.map(function (_, i) { return baseGenerator(i, context, curve); });
    points.unshift(curve.G());
    var scalars = messages.slice();
    scalars.unshift(randomness.sec.S);
    var c = (0, utils_1.multiplyAndSumScalarsAndPoints)(scalars, points);
    return new commitment_1.Commitment(c, randomness.sec.S);
}
exports.commit = commit;
function baseGenerator(i, context, curve) {
    var string = (0, utils_1.concatForHashing)([
        context,
        (0, utils_1.pointToHex)(curve.G()),
        i
    ]);
    return (0, utils_1.hashIntoPoint)(string, curve);
}
//# sourceMappingURL=scheme.js.map