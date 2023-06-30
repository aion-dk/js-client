"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptCommitmentOpening = exports.decryptCommitmentOpening = void 0;
var aes_1 = require("./aes");
function decryptCommitmentOpening(verifierPrivateKey, encryptedCommitmentOpening) {
    var dhPackage = aes_1.DHPackage.fromString(encryptedCommitmentOpening);
    var message = (0, aes_1.dhDecrypt)(verifierPrivateKey, dhPackage);
    return JSON.parse(message);
}
exports.decryptCommitmentOpening = decryptCommitmentOpening;
function encryptCommitmentOpening(verifierPublicKey, commitmentOpening) {
    var message = JSON.stringify(commitmentOpening);
    var dhPackage = (0, aes_1.dhEncrypt)(verifierPublicKey, message);
    return dhPackage.toString();
}
exports.encryptCommitmentOpening = encryptCommitmentOpening;
//# sourceMappingURL=commitments.js.map