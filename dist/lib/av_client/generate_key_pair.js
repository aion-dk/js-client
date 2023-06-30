"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomKeyPair = void 0;
var aion_crypto_1 = require("./aion_crypto");
function randomKeyPair() {
    var keyPair = (0, aion_crypto_1.generateKeyPair)();
    return {
        privateKey: keyPair.private_key,
        publicKey: keyPair.public_key
    };
}
exports.randomKeyPair = randomKeyPair;
//# sourceMappingURL=generate_key_pair.js.map