"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pattern = exports.fromString = exports.Signature = void 0;
var utils_1 = require("../utils");
var Signature = /** @class */ (function () {
    function Signature(e, s, curve) {
        this.e = e;
        this.s = s;
        this.curve = curve;
    }
    Signature.prototype.toString = function () {
        var _this = this;
        return [this.e, this.s].map(function (s) { return (0, utils_1.scalarToHex)(s, _this.curve); }).join(",");
    };
    return Signature;
}());
exports.Signature = Signature;
function fromString(string, curve) {
    if (!string.match(pattern(curve))) {
        throw new Error("input must match " + pattern(curve).source);
    }
    var strings = string.split(',');
    var e = (0, utils_1.hexToScalar)(strings[0], curve);
    var s = (0, utils_1.hexToScalar)(strings[1], curve);
    return new Signature(e, s, curve);
}
exports.fromString = fromString;
function pattern(curve) {
    return new RegExp("^(" +
        curve.scalarHexPrimitive().source +
        "," +
        curve.scalarHexPrimitive().source +
        ")$");
}
exports.pattern = pattern;
//# sourceMappingURL=signature.js.map