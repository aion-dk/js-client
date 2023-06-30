"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var key_derivation_1 = require("../../lib/av_crypto/key_derivation");
var sjcl = require("sjcl-with-all");
var test_helpers_1 = require("./test_helpers");
describe("Key Derivation", function () {
    describe("pbkdf2()", function () {
        var keyByteLength = 32;
        var password = "Chamber of Secrets";
        it("has the right bit size", function () {
            var key = (0, key_derivation_1.pbkdf2)(password, keyByteLength);
            (0, chai_1.expect)(sjcl.bitArray.bitLength(key)).to.equal(keyByteLength * 8);
            (0, chai_1.expect)(sjcl.codec.hex.fromBits(key)).to.equal((0, test_helpers_1.hexString)("750c0ca7 c15d771d 185ec0a8 a146ec84" +
                "cb94cc9d 57277a82 5e218dfa 28281a22"));
        });
    });
    describe("hkdf()", function () {
        var keyByteLength = 32;
        var inputKey = sjcl.codec.utf8String.toBits("my secret key");
        it("has the right bit size", function () {
            var key = (0, key_derivation_1.hkdf)(inputKey, keyByteLength);
            (0, chai_1.expect)(sjcl.bitArray.bitLength(key)).to.equal(keyByteLength * 8);
            (0, chai_1.expect)(sjcl.codec.hex.fromBits(key)).to.equal((0, test_helpers_1.hexString)("eb0bcf6a 52734168 196b07e8 a078b979" +
                "b336e78b 4c3d2147 189f664e 34925d7b"));
        });
    });
});
//# sourceMappingURL=key_derivation.test.js.map