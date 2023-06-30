"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var fs = require("fs");
var test_helpers_1 = require("./test_helpers");
var nist_converter_1 = require("../lib/util/nist_converter");
describe('Util#nistCvrToAvCvr', function () {
    var readFile = function (fileName) {
        return fs.readFileSync(require.resolve(fileName), 'utf8');
    };
    context('NIST converter transforms 1500-103 XML to json', function () {
        it('Convert simple selection for single contest', function () { return __awaiter(void 0, void 0, void 0, function () {
            var xml, result;
            return __generator(this, function (_a) {
                xml = readFile('./cvrs/jetsons_bedrock-precinct2_cvr.xml');
                result = nist_converter_1.default.nistCvrToAvCvr(xml);
                (0, chai_1.expect)(result).to.eql({
                    'contest-ballot-measure-gadget-county-1': 'contest-ballot-measure-1--selection-yes'
                });
                return [2 /*return*/];
            });
        }); });
        it('Convert simple selection for two contests', function () {
            var xml = readFile('./cvrs/sample1.xml');
            var result = nist_converter_1.default.nistCvrToAvCvr(xml);
            (0, chai_1.expect)(result['1']).to.eq('option1');
            (0, chai_1.expect)(result['2']).to.eq('optiona');
        });
        it('No contests throws an error', function () { return __awaiter(void 0, void 0, void 0, function () {
            var xml;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        xml = readFile('./cvrs/no_contests.xml');
                        return [4 /*yield*/, (0, test_helpers_1.expectError)(function () { return nist_converter_1.default.nistCvrToAvCvr(xml); }, Error, 'No CVRContest found')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('No contest selection throws an error', function () { return __awaiter(void 0, void 0, void 0, function () {
            var xml;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        xml = readFile('./cvrs/no_contest_selection.xml');
                        return [4 /*yield*/, (0, test_helpers_1.expectError)(function () { return nist_converter_1.default.nistCvrToAvCvr(xml); }, Error, 'No CVRContestSelection found')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('Extracts correct snapshot', function () {
            var xml = readFile('./cvrs/sample2.xml');
            var result = nist_converter_1.default.nistCvrToAvCvr(xml);
            (0, chai_1.expect)(result['1']).to.eq('option2');
            (0, chai_1.expect)(result['2']).to.eq('optionb');
        });
        it('Fails on missing input', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, test_helpers_1.expectError)(function () { return nist_converter_1.default.nistCvrToAvCvr(''); }, Error, 'Failure converting empty NIST CVR')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('Fails on malformed input', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, test_helpers_1.expectError)(function () { return nist_converter_1.default.nistCvrToAvCvr('hello world'); }, Error, 'Failure converting malformed NIST CVR')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=nist_converter.test.js.map