"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.flattenOptions = void 0;
function flattenOption(option) {
    var clone = __assign({}, option);
    delete clone.children;
    var children = option.children || [];
    return [clone].concat(flattenOptions(children));
}
function flattenOptions(options) {
    var reducer = function (list, option) { return list.concat(flattenOption(option)); };
    return options.reduce(reducer, []);
}
exports.flattenOptions = flattenOptions;
//# sourceMappingURL=flatten_options.js.map