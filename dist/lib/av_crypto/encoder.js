"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Encoder = void 0;
var utils_1 = require("./utils");
var ADJUSTING_BYTE_COUNT = 1;
var ENCODING_ITERATIONS = ADJUSTING_BYTE_COUNT * 256;
var Encoder = /** @class */ (function () {
    function Encoder(curve) {
        this.curve = curve;
        this.pointEncodingByteSize = Math.floor(curve.degree() / 8.0) - ADJUSTING_BYTE_COUNT;
    }
    Encoder.prototype.pointsToBytes = function (points) {
        var _this = this;
        return points.flatMap(function (point) { return _this.pointToBytes(point); });
    };
    Encoder.prototype.bytesToPoints = function (bytes) {
        if (bytes.some(function (b) { return b < 0 || b >= 256; })) {
            throw new Error("input must be an array of bytes (between 0 and 255)");
        }
        var points = [];
        for (var i = 0; i < bytes.length; i += this.pointEncodingByteSize) {
            var bytesSlice = bytes.slice(i, i + this.pointEncodingByteSize);
            var paddedBytesSlice = this.padBytes(bytesSlice);
            points.push(this.encodeIntoPoint(paddedBytesSlice));
        }
        return points;
    };
    Encoder.prototype.padBytes = function (bytes) {
        var paddingBytes = Array(this.pointEncodingByteSize - bytes.length).fill(0);
        return bytes.concat(paddingBytes);
    };
    Encoder.prototype.encodeIntoPoint = function (bytes) {
        var _this = this;
        var bytesHex = bytes.map(function (b) { return _this.byteToHex(b); }).join('');
        for (var i = 0; i < ENCODING_ITERATIONS; i++) {
            try {
                return this.generatePoint(bytesHex, i);
            }
            catch (_a) {
                continue;
            }
        }
        throw new Error("unable to encode bytes into a point on the curve");
    };
    Encoder.prototype.generatePoint = function (bytesHex, i) {
        var adjustmentHex = this.byteToHex(i);
        // pad `00` to the left because of the secp521r1 curve
        var paddingHex = Array(this.curve.scalarHexSize() - adjustmentHex.length - bytesHex.length).fill("0").join('');
        var pointHex = "02" + paddingHex + adjustmentHex + bytesHex;
        return (0, utils_1.hexToPoint)(pointHex, this.curve);
    };
    Encoder.prototype.pointToBytes = function (point) {
        if (point.isIdentity) {
            throw new Error("unable to decode infinity point");
        }
        var pointHex = (0, utils_1.pointToHex)(point);
        var bytesHex = pointHex.slice(-this.pointEncodignHexSize());
        var bytes = [];
        for (var i = 0; i < bytesHex.length; i += 2) {
            bytes.push(parseInt(bytesHex.substring(i, i + 2), 16));
        }
        return bytes;
    };
    Encoder.prototype.byteToHex = function (byte) {
        return byte.toString(16).padStart(2, '0');
    };
    Encoder.prototype.pointEncodignHexSize = function () {
        return this.pointEncodingByteSize * 2;
    };
    return Encoder;
}());
exports.Encoder = Encoder;
//# sourceMappingURL=encoder.js.map