"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var test_helpers_1 = require("../test_helpers");
var curve_1 = require("../../../lib/av_crypto/curve");
var signature_1 = require("../../../lib/av_crypto/schnorr/signature");
describe("Schnorr signature", function () {
    var curve = new curve_1.Curve('k256');
    var e = (0, test_helpers_1.fixedScalar1)(curve);
    var s = (0, test_helpers_1.fixedScalar2)(curve);
    describe("constructor", function () {
        var signature = new signature_1.Signature(e, s, curve);
        it("constructs a commitment", function () {
            (0, chai_1.expect)(signature.e).to.equal(e);
            (0, chai_1.expect)(signature.s).to.equal(s);
        });
    });
    describe("toString()", function () {
        var signature = new signature_1.Signature(e, s, curve);
        it("returns the right pattern", function () {
            (0, chai_1.expect)(signature.toString()).to.match((0, signature_1.pattern)(curve));
        });
    });
    describe("pattern()", function () {
        it("returns the right value", function () {
            (0, chai_1.expect)((0, signature_1.pattern)(curve).source).to.equal("^(([a-f0-9]{64}),([a-f0-9]{64}))$");
        });
    });
    describe("fromString()", function () {
        var string = [(0, test_helpers_1.fixedScalar1Hex)(curve), (0, test_helpers_1.fixedScalar2Hex)(curve)].join(',');
        it("constructs the right signature", function () {
            var signature = (0, signature_1.fromString)(string, curve);
            (0, chai_1.expect)(signature.e).to.eql((0, test_helpers_1.fixedScalar1)(curve));
            (0, chai_1.expect)(signature.s).to.eql((0, test_helpers_1.fixedScalar2)(curve));
        });
        context("when given malformatted string", function () {
            var string = "a,b";
            it("throws error", function () {
                (0, chai_1.expect)(function () {
                    (0, signature_1.fromString)(string, curve);
                }).to.throw("input must match " + (0, signature_1.pattern)(curve).source);
            });
        });
    });
});
//# sourceMappingURL=signature.test.js.map