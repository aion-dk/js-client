"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReceipt = void 0;
var short_codes_1 = require("./short_codes");
function generateReceipt(serverReceipt, castRequest) {
    return {
        trackingCode: (0, short_codes_1.hexToShortCode)(castRequest.address.substring(0, 10)),
        receipt: {
            address: castRequest.address,
            dbbSignature: serverReceipt,
            voterSignature: castRequest.signature
        }
    };
}
exports.generateReceipt = generateReceipt;
//# sourceMappingURL=generate_receipt.js.map