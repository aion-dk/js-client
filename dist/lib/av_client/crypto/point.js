"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Point = void 0;
var crypto = require("../aion_crypto");
var Point = /** @class */ (function () {
    function Point(point) {
        var _this = this;
        this.equals = function (other) { return !!crypto.pointEquals(_this.eccPoint, other.eccPoint); };
        this.mult = function (k) { return new Point(_this.eccPoint.mult(k.toBn())); };
        this.toBits = function (compressed) { return crypto.pointToBits(_this.eccPoint, compressed); };
        this.toEccPoint = function () { return _this.eccPoint; };
        this.eccPoint = point;
    }
    return Point;
}());
exports.Point = Point;
//# sourceMappingURL=point.js.map