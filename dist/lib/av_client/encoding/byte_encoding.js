"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectionPileToByteArray = exports.byteArrayToSelectionPile = void 0;
var flatten_options_1 = require("../flatten_options");
var byte_array_reader_1 = require("./byte_array_reader");
var byte_array_writer_1 = require("./byte_array_writer");
function byteArrayToSelectionPile(contestConfig, byteArray, multiplier) {
    var _a = contestConfig.content, markingType = _a.markingType, options = _a.options;
    var codeSize = markingType.encoding.codeSize;
    var flatOptions = (0, flatten_options_1.flattenOptions)(options);
    var referenceMap = extractReferenceMap(flatOptions);
    var writeInMap = extractWriteInMap(flatOptions);
    var optionSelections = [];
    var reader = new byte_array_reader_1.ByteArrayReader(byteArray);
    while (reader.hasMore()) {
        var code = reader.readInteger(codeSize);
        if (code === 0)
            throw new Error('ArgumentError: Unexpected bytes found in byte array');
        var reference = referenceMap[code];
        if (!reference)
            throw new Error('ArgumentError: Unexpected option code encountered');
        // Is the selected option a write in?
        var writeIn = writeInMap[reference];
        if (writeIn) {
            var text = reader.readString(writeIn.maxSize);
            optionSelections.push({ reference: reference, text: text });
        }
        else {
            optionSelections.push({ reference: reference });
        }
    }
    return {
        multiplier: multiplier,
        optionSelections: optionSelections
    };
}
exports.byteArrayToSelectionPile = byteArrayToSelectionPile;
function selectionPileToByteArray(contestConfig, selectionPile) {
    var _a = contestConfig.content, markingType = _a.markingType, options = _a.options;
    var flatOptions = (0, flatten_options_1.flattenOptions)(options);
    var codeMap = extractCodeMap(flatOptions);
    var writeInMap = extractWriteInMap(flatOptions);
    var writer = new byte_array_writer_1.ByteArrayWriter(markingType.encoding.maxSize);
    selectionPile.optionSelections.forEach(function (optionSelection) {
        var writeIn = writeInMap[optionSelection.reference];
        var code = codeMap[optionSelection.reference];
        if (!code)
            throw new Error("Option reference not found");
        if (writeIn && writeIn.encoding !== 'utf8')
            throw new Error("Unsupported encoding '".concat(writeIn.encoding, "' for write in"));
        writer.writeInteger(markingType.encoding.codeSize, code);
        if (writeIn) {
            var text = optionSelection.text || '';
            writer.writeString(writeIn.maxSize, text);
        }
    });
    return writer.getByteArray();
}
exports.selectionPileToByteArray = selectionPileToByteArray;
function extractWriteInMap(flatOptions) {
    var writeInOptions = flatOptions.filter(function (option) { return option.writeIn; });
    return Object.fromEntries(writeInOptions.map(function (option) { return [option.reference, option.writeIn]; }));
}
function extractCodeMap(flatOptions) {
    return Object.fromEntries(flatOptions.map(function (option) { return [option.reference, option.code]; }));
}
function extractReferenceMap(flatOptions) {
    return Object.fromEntries(flatOptions.map(function (option) { return [option.code, option.reference]; }));
}
//# sourceMappingURL=byte_encoding.js.map