"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomKeyPair = void 0;
const Crypto = require('./aion_crypto.js')();
function randomKeyPair() {
    const keyPair = Crypto.generateKeyPair();
    return {
        privateKey: keyPair.private_key,
        publicKey: keyPair.public_key
    };
}
exports.randomKeyPair = randomKeyPair;
//# sourceMappingURL=generate_key_pair.js.map