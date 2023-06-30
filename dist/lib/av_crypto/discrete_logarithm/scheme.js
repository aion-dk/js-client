"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prove = exports.isValid = void 0;
var utils_1 = require("../utils");
var proof_1 = require("./proof");
function isValid(proof, context, generators, points, publicKey, curve) {
    if (context === void 0) { context = ""; }
    if (points.length != generators.length) {
        throw new Error("generators and points must have the same size");
    }
    var pointsString = concatHexedPoints(points);
    // Recompute the challenge
    var c = computeChallenge(context, generators, pointsString, proof.k, curve);
    var zis = points.map(function (_, i) { return computeZi(pointsString, i, curve); });
    var lhs = computeLHS(generators, proof.r, zis, curve);
    var rhs = computeRHS(points, c, publicKey, proof.k, zis, curve);
    // Is the equation true
    return (0, utils_1.pointEquals)(lhs, rhs);
}
exports.isValid = isValid;
function prove(knowledge, context, curve, generators, randomness, points) {
    if (context === void 0) { context = ""; }
    if (generators === void 0) { generators = [curve.G()]; }
    if (randomness === void 0) { randomness = (0, utils_1.generateKeyPair)(curve); }
    points = points || generators.map(function (g) { return g.mult(knowledge); });
    // Generate the commitment for the proof
    var pointsString = concatHexedPoints(points);
    var k = computeCommitment(generators, randomness, pointsString, curve);
    // Compute the challenge
    var c = computeChallenge(context, generators, pointsString, k, curve);
    // Compute response
    // NOTE: We add instead of subtracting to prevent negative numbers
    //       which we would have to remember to handle multiple places.
    //       Doing addition increases testability, stability, and
    //       maintainability of the code.
    var r = randomness.sec.S.add(c.mul(knowledge)).mod(curve.order());
    return new proof_1.Proof(k, r, curve);
}
exports.prove = prove;
function concatHexedPoints(points) {
    return (0, utils_1.concatForHashing)(points.map(function (p) { return (0, utils_1.pointToHex)(p); }));
}
function computeCommitment(generators, randomness, points_string, curve) {
    var scalars = new Array;
    scalars.push(randomness.sec.S);
    for (var i = 0; i < generators.length; i++) {
        var zi = computeZi(points_string, i, curve).mulmod(randomness.sec.S, curve.order());
        scalars.push(zi);
    }
    var points = generators.slice();
    points.unshift(curve.G());
    return (0, utils_1.multiplyAndSumScalarsAndPoints)(scalars, points);
}
function computeZi(points_string, i, curve) {
    var zString = (0, utils_1.concatForHashing)([points_string, i]);
    return (0, utils_1.hashIntoScalar)(zString, curve);
}
function computeChallenge(context, generators, pointsString, k, curve) {
    var challengeString = (0, utils_1.concatForHashing)([
        context,
        concatHexedPoints(generators),
        pointsString,
        (0, utils_1.pointToHex)(k)
    ]);
    return (0, utils_1.hashIntoScalar)(challengeString, curve);
}
// Left hand side of the verification equation
// NOTE: This is based on the generators because we have changed how
//       we're computing the proof response (addition instead of
//       subtraction).
function computeLHS(generators, r, zis, curve) {
    var scalars = zis.map(function (zi) { return zi.mulmod(r, curve.order()); });
    scalars.unshift(r);
    var points = generators.slice();
    points.unshift(curve.G());
    return (0, utils_1.multiplyAndSumScalarsAndPoints)(scalars, points);
}
// Right hand side of the verification equation
// NOTE: This is based on the commitment of the proof and the points
//       because we have changed how we're computing the proof response
//       (addition instead of subtraction).
function computeRHS(points, c, publicKey, k, zis, curve) {
    var scalars = zis.map(function (zi) { return zi.mulmod(c, curve.order()); });
    scalars.unshift(c);
    points = points.slice();
    points.unshift(publicKey);
    return (0, utils_1.addPoints)([
        k,
        (0, utils_1.multiplyAndSumScalarsAndPoints)(scalars, points)
    ]);
}
//# sourceMappingURL=scheme.js.map