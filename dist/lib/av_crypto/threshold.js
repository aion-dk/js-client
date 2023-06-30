"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeLambda = exports.computePublicShare = void 0;
var utils_1 = require("./utils");
var sjcl = require("sjcl-with-all");
function computePublicShare(id, publicKeys, coefficients, curve) {
    var points = publicKeys.concat(coefficients.flat());
    var scalars = Array(publicKeys.length).fill(new sjcl.bn(1));
    for (var _i = 0, coefficients_1 = coefficients; _i < coefficients_1.length; _i++) {
        var coefficient_array = coefficients_1[_i];
        for (var i = 1; i <= coefficient_array.length; i++) {
            var degree = new sjcl.bn(i);
            scalars.push(id.powermod(degree, curve.order()));
        }
    }
    return (0, utils_1.multiplyAndSumScalarsAndPoints)(scalars, points);
}
exports.computePublicShare = computePublicShare;
function computeLambda(id, otherIDs, curve) {
    var i = id;
    var lambda = new sjcl.bn(1);
    for (var _i = 0, otherIDs_1 = otherIDs; _i < otherIDs_1.length; _i++) {
        var j = otherIDs_1[_i];
        lambda = lambda
            .mul(j)
            .mul(-1)
            .mul(i.sub(j).mod(curve.order()).inverseMod(curve.order()))
            .mod(curve.order());
    }
    return lambda;
}
exports.computeLambda = computeLambda;
//# sourceMappingURL=threshold.js.map