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
var short_codes_1 = require("../lib/av_client/short_codes");
describe('hexToShortCode', function () {
    it('can convert a 10 char hex to a 7 char base58 code', function () { return __awaiter(void 0, void 0, void 0, function () {
        var hex, result;
        return __generator(this, function (_a) {
            hex = 'fffFFffffF';
            result = (0, short_codes_1.hexToShortCode)(hex);
            (0, chai_1.expect)(result).to.equal("VtB5VXc");
            return [2 /*return*/];
        });
    }); });
    it('can convert a hex of zeros', function () { return __awaiter(void 0, void 0, void 0, function () {
        var hex, result;
        return __generator(this, function (_a) {
            hex = '0000000000';
            result = (0, short_codes_1.hexToShortCode)(hex);
            (0, chai_1.expect)(result).to.equal("1111111");
            return [2 /*return*/];
        });
    }); });
    it('fails when a hex contains more than 40 bits', function () {
        var hex = 'f0000000000';
        (0, chai_1.expect)(function () { return (0, short_codes_1.hexToShortCode)(hex); }).to.throw(Error, 'Invalid input. Only up to 40 bits are supported.');
    });
    it('fails when passing a non-hex character', function () {
        var hex = 'z';
        (0, chai_1.expect)(function () { return (0, short_codes_1.hexToShortCode)(hex); }).to.throw(Error, 'Non-hex character');
    });
});
describe('shortCodeToHex', function () {
    it('can convert a 7 char base58 code to a 10 char hex code', function () { return __awaiter(void 0, void 0, void 0, function () {
        var shortCode, result;
        return __generator(this, function (_a) {
            shortCode = "VtB5VXc";
            result = (0, short_codes_1.shortCodeToHex)(shortCode);
            (0, chai_1.expect)(result).to.equal("ffffffffff");
            return [2 /*return*/];
        });
    }); });
    it('can convert a base58 of 1s', function () { return __awaiter(void 0, void 0, void 0, function () {
        var shortCode, result;
        return __generator(this, function (_a) {
            shortCode = "1111111";
            result = (0, short_codes_1.shortCodeToHex)(shortCode);
            (0, chai_1.expect)(result).to.equal("0000000000");
            return [2 /*return*/];
        });
    }); });
    it('fails when a base58 code contains more than 40 bits', function () {
        var shortCode = "VtB5VXd";
        (0, chai_1.expect)(function () { return (0, short_codes_1.shortCodeToHex)(shortCode); }).to.throw(Error, 'Invalid input. Only up to 40 bits are supported.');
    });
    it('fails when passing a non-base58 character', function () {
        var shortCode = "0";
        (0, chai_1.expect)(function () { return (0, short_codes_1.shortCodeToHex)(shortCode); }).to.throw(Error, 'Non-base58 character');
    });
});
//# sourceMappingURL=short_codes.test.js.map