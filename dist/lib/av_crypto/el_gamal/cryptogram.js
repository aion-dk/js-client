"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pattern = exports.fromString = exports.Cryptogram = void 0;
var utils_1 = require("../utils");
var Cryptogram = /** @class */ (function () {
    function Cryptogram(r, c) {
        this.r = r;
        this.c = c;
    }
    Cryptogram.prototype.toString = function () {
        return [this.r, this.c].map(function (p) { return (0, utils_1.pointToHex)(p); }).join(",");
    };
    return Cryptogram;
}());
exports.Cryptogram = Cryptogram;
function fromString(string, curve) {
    if (!string.match(pattern(curve))) {
        throw new Error("input must match " + pattern(curve).source);
    }
    var strings = string.split(',');
    var r = (0, utils_1.hexToPoint)(strings[0], curve);
    var c = (0, utils_1.hexToPoint)(strings[1], curve);
    return new Cryptogram(r, c);
}
exports.fromString = fromString;
function pattern(curve) {
    return new RegExp("^(" +
        curve.pointHexPrimitive().source +
        "," +
        curve.pointHexPrimitive().source +
        ")$");
}
exports.pattern = pattern;
//# sourceMappingURL=cryptogram.js.map