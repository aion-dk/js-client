"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var test_helpers_1 = require("../test_helpers");
var curve_1 = require("../../../lib/av_crypto/curve");
var cryptogram_1 = require("../../../lib/av_crypto/el_gamal/cryptogram");
describe("ElGamal cryptogram", function () {
    var curve = new curve_1.Curve('k256');
    var r = (0, test_helpers_1.fixedPoint1)(curve);
    var c = (0, test_helpers_1.fixedPoint2)(curve);
    var cryptogram = new cryptogram_1.Cryptogram(r, c);
    describe("constructor", function () {
        it("constructs a cryptogram", function () {
            (0, chai_1.expect)(cryptogram.r).to.equal(r);
            (0, chai_1.expect)(cryptogram.c).to.equal(c);
        });
    });
    describe("toString()", function () {
        it("returns the right pattern", function () {
            (0, chai_1.expect)(cryptogram.toString()).to.match((0, cryptogram_1.pattern)(curve));
        });
    });
    describe("pattern()", function () {
        it("returns the right value", function () {
            (0, chai_1.expect)((0, cryptogram_1.pattern)(curve).source).to.equal("^(((?:02|03)([a-f0-9]{64})|00),((?:02|03)([a-f0-9]{64})|00))$");
        });
    });
    describe("fromString()", function () {
        var string = [(0, test_helpers_1.fixedPoint1Hex)(curve), (0, test_helpers_1.fixedPoint2Hex)(curve)].join(',');
        it("constructs the right cryptogram", function () {
            var cryptogram = (0, cryptogram_1.fromString)(string, curve);
            (0, chai_1.expect)(cryptogram.r).to.eql((0, test_helpers_1.fixedPoint1)(curve));
            (0, chai_1.expect)(cryptogram.c).to.eql((0, test_helpers_1.fixedPoint2)(curve));
        });
        context("when given malformatted string", function () {
            var string = "a,b";
            it("throws error", function () {
                (0, chai_1.expect)(function () {
                    (0, cryptogram_1.fromString)(string, curve);
                }).to.throw("input must match " + (0, cryptogram_1.pattern)(curve).source);
            });
        });
    });
});
//# sourceMappingURL=cryptpogram.test.js.map