"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pattern = exports.fromString = exports.Proof = void 0;
var utils_1 = require("../utils");
var Proof = /** @class */ (function () {
    function Proof(k, r, curve) {
        this.k = k;
        this.r = r;
        this.curve = curve;
    }
    Proof.prototype.toString = function () {
        return [
            (0, utils_1.pointToHex)(this.k),
            (0, utils_1.scalarToHex)(this.r, this.curve)
        ].join(",");
    };
    return Proof;
}());
exports.Proof = Proof;
function fromString(string, curve) {
    if (!string.match(pattern(curve))) {
        throw new Error("input must match " + pattern(curve).source);
    }
    var strings = string.split(',');
    var k = (0, utils_1.hexToPoint)(strings[0], curve);
    var r = (0, utils_1.hexToScalar)(strings[1], curve);
    return new Proof(k, r, curve);
}
exports.fromString = fromString;
function pattern(curve) {
    return new RegExp("^(" +
        curve.pointHexPrimitive().source +
        "," +
        curve.scalarHexPrimitive().source +
        ")$");
}
exports.pattern = pattern;
//# sourceMappingURL=proof.js.map