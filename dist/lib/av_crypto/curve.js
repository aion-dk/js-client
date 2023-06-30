"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Curve = void 0;
var sjcl = require("sjcl-with-all");
var sha384_1 = require("./sha384");
var Curve = /** @class */ (function () {
    function Curve(name) {
        this._curve = sjcl.ecc.curves[name];
        if (this._curve === undefined) {
            throw new Error("curve name is invalid");
        }
    }
    Curve.prototype.curve = function () {
        return this._curve;
    };
    Curve.prototype.order = function () {
        return this._curve.r;
    };
    Curve.prototype.prime = function () {
        return this._curve.field.modulus;
    };
    Curve.prototype.degree = function () {
        switch (this._curve) {
            case sjcl.ecc.curves.c521:
                return 521;
            default:
                return this.prime().bitLength();
        }
    };
    Curve.prototype.a = function () {
        return this._curve.a;
    };
    Curve.prototype.b = function () {
        return this._curve.b;
    };
    Curve.prototype.G = function () {
        return this._curve.G;
    };
    Curve.prototype.sha = function () {
        switch (this._curve) {
            case sjcl.ecc.curves.c521:
                return sjcl.hash.sha512;
            case sjcl.ecc.curves.c384:
                return sha384_1.SHA384;
            default:
                return sjcl.hash.sha256;
        }
    };
    Curve.prototype.pointHexPattern = function () {
        return new RegExp('^' + this.pointHexPrimitive().source + '$');
    };
    Curve.prototype.scalarHexPattern = function () {
        return new RegExp('^' + this.scalarHexPrimitive().source + '$');
    };
    Curve.prototype.pointHexPrimitive = function () {
        return new RegExp('((?:02|03)' + this.scalarHexPrimitive().source + '|00)');
    };
    Curve.prototype.scalarHexPrimitive = function () {
        return new RegExp('([a-f0-9]{' + this.scalarHexSize() + '})');
    };
    Curve.prototype.scalarHexSize = function () {
        return this.scalarByteSize() * 2;
    };
    Curve.prototype.scalarByteSize = function () {
        return this._curve.field.modulus.bitLength() / 8;
    };
    return Curve;
}());
exports.Curve = Curve;
//# sourceMappingURL=curve.js.map