"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bignum = void 0;
var sjcl = require("../sjcl");
// As this is working with untyped SJCL classes,
// we need the _any_ type in this wrapper.
/*eslint-disable @typescript-eslint/no-explicit-any*/
var Bignum = /** @class */ (function () {
    function Bignum(data) {
        var _this = this;
        this.isEven = function () { return _this.bn.limbs[0] % 2 === 0; };
        this.equals = function (other) { return !!_this.bn.equals(other.bn); };
        this.mod = function (operand) { return new Bignum(_this.bn.mod(operand.bn)); };
        this.add = function (operand) { return new Bignum(_this.bn.add(operand.bn)); };
        this.toBits = function () { return _this.bn.toBits(); };
        this.toBn = function () { return _this.bn; };
        this.bn = new sjcl.bn(data);
    }
    return Bignum;
}());
exports.Bignum = Bignum;
//# sourceMappingURL=bignum.js.map