"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeOptionFinder = void 0;
var flatten_options_1 = require("./flatten_options");
var errors_1 = require("./errors");
function makeOptionFinder(options) {
    var flatOptions = (0, flatten_options_1.flattenOptions)(options);
    var optionMap = extractOptionMap(flatOptions);
    return function (reference) {
        var option = optionMap[reference];
        if (option)
            return option;
        throw new errors_1.InvalidOptionError('Option could not be found');
    };
}
exports.makeOptionFinder = makeOptionFinder;
function extractOptionMap(flatOptions) {
    return Object.fromEntries(flatOptions.map(function (option) { return [option.reference, option]; }));
}
//# sourceMappingURL=option_finder.js.map