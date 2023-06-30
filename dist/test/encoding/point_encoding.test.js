"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var point_encoding_1 = require("../../lib/av_client/encoding/point_encoding");
var sjcl = require("../../lib/av_client/sjcl");
var crypto = require("../../lib/av_client/aion_crypto");
describe('encode bytes into ec points', function () {
    it('converts bytes to points', function () {
        var bytes = Uint8Array.from([1, 2, 3]);
        var points = (0, point_encoding_1.bytesToPoints)(bytes);
        (0, chai_1.expect)(points.length).to.equal(1);
    });
    it('converts a black vote into none infinity points', function () {
        var bytes = Uint8Array.from([0, 0, 0]);
        var points = (0, point_encoding_1.bytesToPoints)(bytes);
        (0, chai_1.expect)(points.every(function (point) { return !point.isIdentity; })).to.be.true;
    });
    it('converts max byte values to one point', function () {
        var bytes = Uint8Array.from(Array(31).fill(255));
        var points = (0, point_encoding_1.bytesToPoints)(bytes);
        (0, chai_1.expect)(points.length).to.equal(1);
    });
    it('converts bytes to two points', function () {
        var bytes = Uint8Array.from(Array(40).fill(10));
        var points = (0, point_encoding_1.bytesToPoints)(bytes);
        (0, chai_1.expect)(points.length).to.equal(2);
    });
    it('converts points to bytes', function () {
        var point1Hex = '020101020300000000000000000000000000000000000000000000000000000000';
        var point2Hex = '020500000000000000000000000000000000000000000000000000000000000000';
        var point1 = crypto.pointFromBits(sjcl.codec.hex.toBits(point1Hex));
        var point2 = crypto.pointFromBits(sjcl.codec.hex.toBits(point2Hex));
        var points = [point1, point2];
        var byteCount = 4;
        var bytes = (0, point_encoding_1.pointsToBytes)(points, byteCount);
        (0, chai_1.expect)(bytes.length).to.equal(byteCount);
    });
    it('fails when trying to read too many bytes from the available points', function () {
        var point1Hex = '020101020300000000000000000000000000000000000000000000000000000000';
        var point1 = crypto.pointFromBits(sjcl.codec.hex.toBits(point1Hex));
        var points = [point1];
        var byteCount = 100;
        (0, chai_1.expect)(function () { return (0, point_encoding_1.pointsToBytes)(points, byteCount); }).to.throw(Error, "Too many bytes to be decoded from points");
    });
    it('fails when decoding points and padding bytes are non 0x00', function () {
        var point1Hex = '020101020300000000000000000000000000000000000000000000000000000000';
        var point1 = crypto.pointFromBits(sjcl.codec.hex.toBits(point1Hex));
        var points = [point1];
        var byteCount = 1;
        (0, chai_1.expect)(function () { return (0, point_encoding_1.pointsToBytes)(points, byteCount); }).to.throw(Error, "Invalid encoding of points");
    });
    it('converts bytes to points and back', function () {
        var bytes = Uint8Array.from([1, 2, 3, 0, 255]);
        var points = (0, point_encoding_1.bytesToPoints)(bytes);
        var bytesBack = (0, point_encoding_1.pointsToBytes)(points, bytes.length);
        (0, chai_1.expect)(bytes.length === bytesBack.length &&
            bytes.every(function (byte, index) { return byte === bytesBack[index]; }))
            .to.be.true;
    });
});
//# sourceMappingURL=point_encoding.test.js.map