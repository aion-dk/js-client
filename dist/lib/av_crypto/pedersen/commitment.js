"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Commitment = void 0;
var Commitment = /** @class */ (function () {
    function Commitment(c, r) {
        this.c = c;
        this.r = r;
    }
    Commitment.prototype.isOpenable = function () {
        return this.r !== undefined;
    };
    return Commitment;
}());
exports.Commitment = Commitment;
//# sourceMappingURL=commitment.js.map