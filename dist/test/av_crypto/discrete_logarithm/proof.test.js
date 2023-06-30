"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var test_helpers_1 = require("../test_helpers");
var curve_1 = require("../../../lib/av_crypto/curve");
var proof_1 = require("../../../lib/av_crypto/discrete_logarithm/proof");
describe("Discrete logarithm proof", function () {
    var curve = new curve_1.Curve('k256');
    var k = (0, test_helpers_1.fixedPoint1)(curve);
    var r = (0, test_helpers_1.fixedScalar2)(curve);
    var proof = new proof_1.Proof(k, r, curve);
    describe("constructor", function () {
        it("constructs a cryptogram", function () {
            (0, chai_1.expect)(proof.k).to.equal(k);
            (0, chai_1.expect)(proof.r).to.equal(r);
        });
    });
    describe("toString()", function () {
        it("returns the right pattern", function () {
            (0, chai_1.expect)(proof.toString()).to.match((0, proof_1.pattern)(curve));
        });
    });
    describe("pattern()", function () {
        it("returns the right value", function () {
            (0, chai_1.expect)((0, proof_1.pattern)(curve).source).to.equal("^(((?:02|03)([a-f0-9]{64})|00),([a-f0-9]{64}))$");
        });
    });
    describe("fromString()", function () {
        var string = [(0, test_helpers_1.fixedPoint1Hex)(curve), (0, test_helpers_1.fixedScalar2Hex)(curve)].join(',');
        it("constructs the right cryptogram", function () {
            var proof = (0, proof_1.fromString)(string, curve);
            (0, chai_1.expect)(proof.k).to.eql((0, test_helpers_1.fixedPoint1)(curve));
            (0, chai_1.expect)(proof.r).to.eql((0, test_helpers_1.fixedScalar2)(curve));
        });
        context("when given malformatted string", function () {
            var string = "a,b";
            it("throws error", function () {
                (0, chai_1.expect)(function () {
                    (0, proof_1.fromString)(string, curve);
                }).to.throw("input must match " + (0, proof_1.pattern)(curve).source);
            });
        });
    });
});
//# sourceMappingURL=proof.test.js.map