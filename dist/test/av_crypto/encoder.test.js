"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var curve_1 = require("../../lib/av_crypto/curve");
var utils_1 = require("../../lib/av_crypto/utils");
var test_helpers_1 = require("./test_helpers");
var encoder_1 = require("../../lib/av_crypto/encoder");
describe("Encoder", function () {
    var curve = new curve_1.Curve("k256");
    var encoder = new encoder_1.Encoder(curve);
    describe("constructor", function () {
        it("constructs an encoder", function () {
            (0, chai_1.expect)(encoder.pointEncodingByteSize).to.equal(31);
        });
        context("with curve secp256r1", function () {
            var curve = new curve_1.Curve("c256");
            var encoder = new encoder_1.Encoder(curve);
            it("constructs an encoder", function () {
                (0, chai_1.expect)(encoder.pointEncodingByteSize).to.equal(31);
            });
        });
        context("with curve secp384r1", function () {
            var curve = new curve_1.Curve("c384");
            var encoder = new encoder_1.Encoder(curve);
            it("constructs an encoder", function () {
                (0, chai_1.expect)(encoder.pointEncodingByteSize).to.equal(47);
            });
        });
        context("with curve secp521r1", function () {
            var curve = new curve_1.Curve("c521");
            var encoder = new encoder_1.Encoder(curve);
            it("constructs an encoder", function () {
                (0, chai_1.expect)(encoder.pointEncodingByteSize).to.equal(64);
            });
        });
    });
    describe("bytesToPoints()", function () {
        var bytes = [1, 2, 3];
        it("produces deterministic points", function () {
            var points = encoder.bytesToPoints(bytes);
            (0, chai_1.expect)(points.length).to.be.equal(1);
            (0, chai_1.expect)((0, utils_1.pointToHex)(points[0])).to.eql((0, test_helpers_1.hexString)("02" +
                "01010203 00000000 00000000 00000000" +
                "00000000 00000000 00000000 00000000"));
        });
        context("with max amount of bytes for one point", function () {
            var bytes = Array.from(Array(31).keys());
            it("produces one point", function () {
                var points = encoder.bytesToPoints(bytes);
                (0, chai_1.expect)(points.length).to.be.equal(1);
            });
        });
        context("with bytes that fit in two points", function () {
            var bytes = Array.from(Array(32).keys());
            it("produces two points", function () {
                var points = encoder.bytesToPoints(bytes);
                (0, chai_1.expect)(points.length).to.be.equal(2);
            });
        });
        context("when bytes have max value", function () {
            var bytes = Array(31).fill(255);
            it("produces one point", function () {
                var points = encoder.bytesToPoints(bytes);
                (0, chai_1.expect)(points.length).to.be.equal(1);
            });
        });
        context("with byte too high", function () {
            var bytes = [256];
            it("throws error", function () {
                (0, chai_1.expect)(function () {
                    encoder.bytesToPoints(bytes);
                }).to.throw("input must be an array of bytes (between 0 and 255)");
            });
        });
        context("with negative byte", function () {
            var bytes = [-10];
            it("throws error", function () {
                (0, chai_1.expect)(function () {
                    encoder.bytesToPoints(bytes);
                }).to.throw("input must be an array of bytes (between 0 and 255)");
            });
        });
        context("with empty byte array", function () {
            var bytes = [];
            it("produces no points", function () {
                var points = encoder.bytesToPoints(bytes);
                (0, chai_1.expect)(points.length).to.be.equal(0);
            });
        });
        context("with curve secp521r1", function () {
            var curve = new curve_1.Curve("c521");
            var encoder = new encoder_1.Encoder(curve);
            it("produces deterministic points", function () {
                var points = encoder.bytesToPoints(bytes);
                (0, chai_1.expect)(points.length).to.be.equal(1);
                (0, chai_1.expect)((0, utils_1.pointToHex)(points[0])).to.eql((0, test_helpers_1.hexString)("020001" +
                    "01020300 00000000 00000000 00000000" +
                    "00000000 00000000 00000000 00000000" +
                    "00000000 00000000 00000000 00000000" +
                    "00000000 00000000 00000000 00000000"));
            });
        });
    });
    describe("pointsToBytes()", function () {
        var points = [(0, test_helpers_1.fixedPoint1)(curve)];
        it("decodes an array of bytes", function () {
            var bytes = encoder.pointsToBytes(points);
            (0, chai_1.expect)(bytes.length).to.be.equal(31);
        });
        context("with a specific point", function () {
            var hex = (0, test_helpers_1.hexString)("02" +
                "01010203 00000000 00000000 00000000" +
                "00000000 00000000 00000000 00000000");
            var point = (0, utils_1.hexToPoint)(hex, curve);
            var points = [point];
            it("decodes the right bytes", function () {
                var bytes = encoder.pointsToBytes(points);
                var expectedBytes = [1, 2, 3].concat(Array(28).fill(0));
                (0, chai_1.expect)(bytes).to.be.eql(expectedBytes);
            });
        });
        context("with multiple points", function () {
            var points = [(0, test_helpers_1.fixedPoint1)(curve), (0, test_helpers_1.fixedPoint2)(curve)];
            it("decodes an array of bytes", function () {
                var bytes = encoder.pointsToBytes(points);
                (0, chai_1.expect)(bytes.length).to.be.equal(62);
            });
        });
        context("with the infinity point", function () {
            var points = [(0, utils_1.infinityPoint)(curve)];
            it("throws error", function () {
                (0, chai_1.expect)(function () {
                    encoder.pointsToBytes(points);
                }).to.throw("unable to decode infinity point");
            });
        });
        context("with curve secp521r1", function () {
            var curve = new curve_1.Curve("c521");
            var encoder = new encoder_1.Encoder(curve);
            var points = [(0, test_helpers_1.fixedPoint1)(curve)];
            it("decodes an array of bytes", function () {
                var bytes = encoder.pointsToBytes(points);
                (0, chai_1.expect)(bytes.length).to.be.equal(64);
            });
        });
    });
});
//# sourceMappingURL=encoder.test.js.map