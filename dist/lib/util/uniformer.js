"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Uniformer = void 0;
var Uniformer = /** @class */ (function () {
    function Uniformer() {
    }
    Uniformer.prototype.formString = function (obj) {
        var sortedEntries = this.walk(obj);
        return JSON.stringify(sortedEntries);
    };
    Uniformer.prototype.toSortedKeyValuePairs = function (obj) {
        var _this = this;
        var toKeyValueTuple = function (_a) {
            var k = _a[0], v = _a[1];
            return [k, _this.walk(v)];
        };
        var sortByKey = function (a, b) { return compareUtf8Strings(a[0], b[0]); };
        var properties = Object.entries(obj);
        return properties
            .map(toKeyValueTuple)
            .sort(sortByKey);
    };
    Uniformer.prototype.getSymbolName = function (symbol) {
        return symbol.slice("Symbol(".length, -1); // Extracts 'foo' from 'Symbol(foo)'
    };
    Uniformer.prototype.walk = function (obj) {
        var _this = this;
        switch (typeof obj) {
            case "string":
            case "number":
            case "boolean": return obj;
            case "symbol": return this.getSymbolName(obj.toString());
            case "object":
                if (obj === null)
                    return null;
                if (obj instanceof Array)
                    return obj.map(function (e) { return _this.walk(e); });
                if (obj instanceof Date)
                    return obj.toISOString();
                return this.toSortedKeyValuePairs(obj);
            default:
                throw new Error("Unknown parameter type '".concat(typeof obj, "'."));
        }
    };
    return Uniformer;
}());
exports.Uniformer = Uniformer;
/**
 * Compares two strings against eachother considering the utf8 bytes produced
 * @param a string 1
 * @param b string 2
 * @returns -1, 0 or 1 depending on order
 */
function compareUtf8Strings(a, b) {
    return compare(utf8StringToHex(a), utf8StringToHex(b));
}
function compare(a, b) {
    if (a > b)
        return 1;
    if (a < b)
        return -1;
    return 0;
}
/**
 * Encodes a string from utf8 bytes to hex
 * @param string string to encode from utf8 bytes to hex
 * @returns hex representation of string
 */
function utf8StringToHex(string) {
    var array = new TextEncoder().encode(string);
    return array.reduce(function (out, i) { return out + ('0' + i.toString(16)).slice(-2); }, "");
}
//# sourceMappingURL=uniformer.js.map