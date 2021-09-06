"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordResponses = exports.deterministicMathRandom = exports.resetDeterministicOffset = exports.deterministicRandomWords = void 0;
function deterministicRandomWords(nwords, _paranoia) {
    const lowestValidNumber = -2147483648;
    const highestValidNumber = 2147483647;
    if (typeof global.deterministicOffset == 'undefined') {
        resetDeterministicOffset();
    }
    let nextRandomInt = global.deterministicOffset;
    let output = [];
    for (let i = 0; i < nwords; i++) {
        if (nextRandomInt > highestValidNumber) {
            nextRandomInt = lowestValidNumber;
        }
        output.push(nextRandomInt++);
    }
    global.deterministicOffset++;
    return output;
}
exports.deterministicRandomWords = deterministicRandomWords;
function resetDeterministicOffset() {
    global.deterministicOffset = 0;
}
exports.resetDeterministicOffset = resetDeterministicOffset;
// Make Math.random deterministic when running tests
function deterministicMathRandom() {
    return 0.42;
}
exports.deterministicMathRandom = deterministicMathRandom;
const nock = require("nock");
const fs = require('fs');
async function recordResponses(callback) {
    setupRecording();
    await callback.call();
    stopRecording();
    saveFiles();
    cleanup();
}
exports.recordResponses = recordResponses;
function setupRecording() {
    nock.restore(); // Clear nock
    nock.recorder.clear(); // Clear recorder
    nock.recorder.rec({
        dont_print: true,
        output_objects: true // Returns objects instead of a string about recording
    });
}
function stopRecording() {
    nock.restore();
}
function saveFiles() {
    const indentationSpaces = 2;
    nock.recorder.play().forEach(function (record) {
        const filePath = filenameFromRequest(record.method, record.path);
        const json = JSON.stringify(record.response, null, indentationSpaces);
        try {
            fs.writeFileSync(filePath, json);
            console.debug(`Response written to ${filePath}`);
        }
        catch (error) {
            console.error(error);
        }
    });
}
function filenameFromRequest(httpMethod, url) {
    const extension = 'json';
    const targetDir = __dirname + '/replies/';
    const urlPathForFilename = url
        .replace(/^\//g, '') // Remove leading slash
        .replace(/=/g, "-") // Convert all '=' to '-', for example, 'foo?bar=1' becomes 'foo?bar-1'
        .replace(/[^\w-]+/g, "_") // Leave alphanumeric characters and dashes as is, convert everything else to underscores
        .toLowerCase(); // Preventing filename case sensitivity issues before they become a pain
    const httpMethodForFilename = httpMethod.toLowerCase(); // Preventing filename case sensitivity issues
    const filename = `${httpMethodForFilename}_${urlPathForFilename}.${extension}`;
    const absolutePath = targetDir + filename;
    return absolutePath;
}
function cleanup() {
    nock.recorder.clear();
    console.debug("Finished recording responses");
}
//# sourceMappingURL=test_helpers.js.map