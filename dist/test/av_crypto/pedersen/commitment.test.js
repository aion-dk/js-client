"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var test_helpers_1 = require("../test_helpers");
var curve_1 = require("../../../lib/av_crypto/curve");
var commitment_1 = require("../../../lib/av_crypto/pedersen/commitment");
describe("Pedersen commitment", function () {
    var curve = new curve_1.Curve('k256');
    var c = (0, test_helpers_1.fixedPoint1)(curve);
    var commitment = new commitment_1.Commitment(c);
    describe("constructor", function () {
        it("constructs a commitment", function () {
            (0, chai_1.expect)(commitment.c).to.equal(c);
        });
        context("when given r", function () {
            var r = (0, test_helpers_1.fixedScalar2)(curve);
            var commitment = new commitment_1.Commitment(c, r);
            it("constructs a commitment", function () {
                (0, chai_1.expect)(commitment.c).to.equal(c);
                (0, chai_1.expect)(commitment.r).to.equal(r);
            });
        });
    });
    describe("isOpenable()", function () {
        it("returns false", function () {
            (0, chai_1.expect)(commitment.isOpenable()).to.be.false;
        });
        context("when given r", function () {
            var r = (0, test_helpers_1.fixedScalar2)(curve);
            var commitment = new commitment_1.Commitment(c, r);
            it("returns true", function () {
                (0, chai_1.expect)(commitment.isOpenable()).to.be.true;
            });
        });
    });
});
//# sourceMappingURL=commitment.test.js.map