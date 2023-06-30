"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var test_helpers_1 = require("./test_helpers");
var curve_1 = require("../../lib/av_crypto/curve");
var utils_1 = require("../../lib/av_crypto/utils");
var threshold_1 = require("../../lib/av_crypto/threshold");
var sjcl = require("sjcl-with-all");
describe("Threshold ceremony computation", function () {
    describe("computePublicShare()", function () {
        var curve = new curve_1.Curve('k256');
        var id = new sjcl.bn(10);
        var publicKeys = [(0, test_helpers_1.fixedPoint1)(curve), (0, test_helpers_1.fixedPoint2)(curve)];
        var coefficients = [[(0, test_helpers_1.fixedPoint1)(curve)], [(0, test_helpers_1.fixedPoint2)(curve)]];
        it("returns the correct value", function () {
            var p1 = (0, test_helpers_1.fixedPoint1)(curve);
            var p2 = (0, test_helpers_1.fixedPoint2)(curve);
            var expected = (0, utils_1.addPoints)([p1, p1.mult(id), p2, p2.mult(id)]);
            var publicShare = (0, threshold_1.computePublicShare)(id, publicKeys, coefficients, curve);
            (0, chai_1.expect)(publicShare).to.eql(expected);
        });
        context("with no coefficients", function () {
            var coefficients = [];
            it("returns", function () {
                var publicShare = (0, threshold_1.computePublicShare)(id, publicKeys, coefficients, curve);
                (0, chai_1.expect)(publicShare).to.exist;
            });
        });
        context("when curve is secp521r1", function () {
            var curve = new curve_1.Curve('k256');
            var publicKeys = [(0, test_helpers_1.fixedPoint1)(curve), (0, test_helpers_1.fixedPoint2)(curve)];
            var coefficients = [[(0, test_helpers_1.fixedPoint1)(curve)], [(0, test_helpers_1.fixedPoint2)(curve)]];
            it("returns", function () {
                var publicShare = (0, threshold_1.computePublicShare)(id, publicKeys, coefficients, curve);
                (0, chai_1.expect)(publicShare).to.exist;
            });
        });
    });
    describe("computeLambda()", function () {
        var curve = new curve_1.Curve('k256');
        var id = new sjcl.bn(10);
        var otherIDs = [new sjcl.bn(26), new sjcl.bn(8)];
        it("returns the correct value", function () {
            var lambda = (0, threshold_1.computeLambda)(id, otherIDs, curve);
            (0, chai_1.expect)((0, utils_1.scalarToHex)(lambda, curve)).to.eql((0, test_helpers_1.hexString)("7fffffff ffffffff ffffffff ffffffff" +
                "5d576e73 57a4501d dfe92f46 681b209a"));
        });
        context("when curve is secp521r1", function () {
            var curve = new curve_1.Curve('k256');
            it("returns", function () {
                var lambda = (0, threshold_1.computeLambda)(id, otherIDs, curve);
                (0, chai_1.expect)(lambda).to.exist;
            });
        });
    });
});
//# sourceMappingURL=threshold.test.js.map