"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var aes_1 = require("../../lib/av_client/crypto/aes");
describe("AES encryption", function () {
    it("dhDecrypt result by dhEncrypt", function () {
        var encryptionKeyHex = '037f875fd4daab85767dfd9cf7d653c4997630c6781d273eab07ec84bf69e55766';
        var decryptionKeyHex = '267db52174df6ed70eff93924257bc500ba020d4d0b4abec66e92ee13e27e483';
        var dhPackage = (0, aes_1.dhEncrypt)(encryptionKeyHex, 'This is a secret message!');
        var message = (0, aes_1.dhDecrypt)(decryptionKeyHex, dhPackage);
        (0, chai_1.expect)(message).to.eq('This is a secret message!');
    });
    describe("Payload", function () {
        it("can instantiate DHPackage from string", function () {
            var dhPackageString = "{\"ciphertext\":\"I7gGraOQsmOhBBgOJRzcgkUWt0bF64f8\",\"tag\":\"IGTwMT/myP5G42pR2ihBjQ==\",\"iv\":\"jrmBVFSB+W+PNKDn\",\"ephemeralPublicKey\":\"0288953f883acc28763e95e034b42c17629e259ec3301f38ce896b80972a240558\"}";
            (0, chai_1.expect)(function () { return aes_1.DHPackage.fromString(dhPackageString); }).to.not.throw();
        });
        it("can parse and serialize a DHPackage back to the same value", function () {
            var dhPackageString = "{\"ciphertext\":\"I7gGraOQsmOhBBgOJRzcgkUWt0bF64f8\",\"tag\":\"IGTwMT/myP5G42pR2ihBjQ==\",\"iv\":\"jrmBVFSB+W+PNKDn\",\"ephemeralPublicKey\":\"0288953f883acc28763e95e034b42c17629e259ec3301f38ce896b80972a240558\"}";
            var result = aes_1.DHPackage.fromString(dhPackageString).toString();
            (0, chai_1.expect)(result).to.eq(dhPackageString);
        });
    });
    describe(".dhDecrypt()", function () {
        var decryptionKeyHex = "9789c13ded67697c6aae048d26f649098f7f499e61db6968505e38a32c0595e3";
        var dhPackageString = "{\"ciphertext\":\"I7gGraOQsmOhBBgOJRzcgkUWt0bF64f8\",\"tag\":\"IGTwMT/myP5G42pR2ihBjQ==\",\"iv\":\"jrmBVFSB+W+PNKDn\",\"ephemeralPublicKey\":\"0288953f883acc28763e95e034b42c17629e259ec3301f38ce896b80972a240558\"}";
        it("can decrypt DHPackage from avx", function () {
            var message = (0, aes_1.dhDecrypt)(decryptionKeyHex, aes_1.DHPackage.fromString(dhPackageString));
            (0, chai_1.expect)(message).to.eq("This is a secret message");
        });
        it("fails when the decryption key is not matching", function () {
            var wrongDecryptionKeyHex = "037f875fd4daab85767dfd9cf7d653c4997630c6781d273eab07ec84bf69e55766";
            (0, chai_1.expect)(function () {
                (0, aes_1.dhDecrypt)(wrongDecryptionKeyHex, aes_1.DHPackage.fromString(dhPackageString));
            }).to.throw("gcm: tag doesn't match");
        });
    });
});
//# sourceMappingURL=aes.test.js.map