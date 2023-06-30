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
exports.validateReceipt = exports.validatePayload = exports.signPayload = void 0;
var Crypto = require("./aion_crypto");
var uniformer_1 = require("../util/uniformer");
var signPayload = function (obj, privateKey) {
    var uniformer = new uniformer_1.Uniformer();
    var uniformPayload = uniformer.formString(obj);
    var signature = Crypto.generateSchnorrSignature(uniformPayload, privateKey);
    return __assign(__assign({}, obj), { signature: signature });
};
exports.signPayload = signPayload;
var validatePayload = function (item, expectations, signaturePublicKey) {
    if (expectations.type != item.type) {
        throw new Error("BoardItem did not match expected type '".concat(expectations.type, "'"));
    }
    if (expectations.parentAddress != item.parentAddress) {
        throw new Error("BoardItem did not match expected parent address ".concat(expectations.parentAddress));
    }
    if (expectations.content !== undefined) {
        var requiredContentAttributes_1 = Object.keys(expectations.content);
        var itemContent = Object.fromEntries(Object.entries(item.content).filter(function (_a) {
            var key = _a[0];
            return requiredContentAttributes_1.includes(key);
        }));
        verifyContent(itemContent, expectations.content);
    }
    verifyAddress(item);
    if (signaturePublicKey !== undefined) {
        verifySignature(item, signaturePublicKey);
    }
};
exports.validatePayload = validatePayload;
var verifySignature = function (item, signaturePublicKey) {
    var uniformer = new uniformer_1.Uniformer();
    var signedPayload = uniformer.formString({
        content: item.content,
        type: item.type,
        parentAddress: item.parentAddress
    });
    if (!Crypto.verifySchnorrSignature(item.signature, signedPayload, signaturePublicKey)) {
        throw new Error('Board signature verification failed');
    }
};
var verifyContent = function (actual, expectations) {
    var uniformer = new uniformer_1.Uniformer();
    var expectedContent = uniformer.formString(expectations);
    var actualContent = uniformer.formString(actual);
    if (expectedContent != actualContent) {
        throw new Error('Item payload failed sanity check. Received item did not match expected');
    }
};
var verifyAddress = function (item) {
    var uniformer = new uniformer_1.Uniformer();
    var addressHashSource = uniformer.formString({
        type: item.type,
        content: item.content,
        parentAddress: item.parentAddress,
        previousAddress: item.previousAddress,
        registeredAt: item.registeredAt
    });
    var expectedItemAddress = Crypto.hashString(addressHashSource);
    if (item.address != expectedItemAddress) {
        throw new Error("BoardItem address does not match expected address '".concat(expectedItemAddress, "'"));
    }
};
var validateReceipt = function (items, receipt, publicKey) {
    var uniformer = new uniformer_1.Uniformer();
    var content = {
        signature: items[0].signature,
        address: items[items.length - 1].address
    };
    var message = uniformer.formString(content);
    if (!Crypto.verifySchnorrSignature(receipt, message, publicKey)) {
        throw new Error('Board receipt verification failed');
    }
};
exports.validateReceipt = validateReceipt;
//# sourceMappingURL=sign.js.map