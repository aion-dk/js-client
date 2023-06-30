"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var curve_1 = require("../../lib/av_crypto/curve");
var sjcl = require("sjcl-with-all");
var utils_1 = require("../../lib/av_crypto/utils");
var test_helpers_1 = require("./test_helpers");
var sha384_1 = require("../../lib/av_crypto/sha384");
describe("Curve", function () {
    describe("constructor", function () {
        it("constructs a Curve instance", function () {
            var name = "k256";
            var curve = new curve_1.Curve(name);
            (0, chai_1.expect)(curve).to.be.an.instanceof(curve_1.Curve);
        });
        context("with curve secp256k1", function () {
            it("assigns the correct sjcl curve", function () {
                var curve = new curve_1.Curve("k256");
                (0, chai_1.expect)(curve.curve()).to.be.equal(sjcl.ecc.curves.k256);
            });
        });
        context("with curve secp256r1", function () {
            it("assigns the correct sjcl curve", function () {
                var curve = new curve_1.Curve("c256");
                (0, chai_1.expect)(curve.curve()).to.be.equal(sjcl.ecc.curves.c256);
            });
        });
        context("with curve secp384r1", function () {
            it("assigns the correct sjcl curve", function () {
                var curve = new curve_1.Curve("c384");
                (0, chai_1.expect)(curve.curve()).to.be.equal(sjcl.ecc.curves.c384);
            });
        });
        context("with curve secp521r1", function () {
            it("assigns the correct sjcl curve", function () {
                var curve = new curve_1.Curve("c521");
                (0, chai_1.expect)(curve.curve()).to.be.equal(sjcl.ecc.curves.c521);
            });
        });
        context("with invalid name", function () {
            it("throws error", function () {
                var name = "hello";
                (0, chai_1.expect)(function () {
                    new curve_1.Curve(name);
                }).to.throw("curve name is invalid");
            });
        });
    });
    describe("curve()", function () {
        it("returns the correct sjcl curve", function () {
            var name = "k256";
            var curve = new curve_1.Curve(name);
            (0, chai_1.expect)(curve.curve()).to.equal(sjcl.ecc.curves.k256);
        });
    });
    describe("order()", function () {
        it("returns the correct value", function () {
            var name = "k256";
            var curve = new curve_1.Curve(name);
            (0, chai_1.expect)((0, utils_1.scalarToHex)(curve.order(), curve)).to.equal((0, test_helpers_1.hexString)("ffffffff ffffffff ffffffff fffffffe" +
                "baaedce6 af48a03b bfd25e8c d0364141"));
        });
        context("with curve secp256r1", function () {
            var name = "c256";
            var curve = new curve_1.Curve(name);
            it("returns the correct value", function () {
                (0, chai_1.expect)((0, utils_1.scalarToHex)(curve.order(), curve)).to.equal((0, test_helpers_1.hexString)("ffffffff 00000000 ffffffff ffffffff" +
                    "bce6faad a7179e84 f3b9cac 2fc632551"));
            });
        });
        context("with curve secp384r1", function () {
            var name = "c384";
            var curve = new curve_1.Curve(name);
            it("returns the correct value", function () {
                (0, chai_1.expect)((0, utils_1.scalarToHex)(curve.order(), curve)).to.equal((0, test_helpers_1.hexString)("ffffffff ffffffff ffffffff ffffffff" +
                    "ffffffff ffffffff c7634d81 f4372ddf" +
                    "581a0db2 48b0a77a ecec196a ccc52973"));
            });
        });
        context("with curve secp521r1", function () {
            var name = "c521";
            var curve = new curve_1.Curve(name);
            it("returns the correct value", function () {
                (0, chai_1.expect)((0, utils_1.scalarToHex)(curve.order(), curve)).to.equal((0, test_helpers_1.hexString)("01ff" +
                    "ffffffff ffffffff ffffffff ffffffff" +
                    "ffffffff ffffffff ffffffff fffffffa" +
                    "51868783 bf2f966b 7fcc0148 f709a5d0" +
                    "3bb5c9b8 899c47ae bb6fb71e 91386409"));
            });
        });
    });
    describe("prime()", function () {
        it("returns the correct value", function () {
            var name = "k256";
            var curve = new curve_1.Curve(name);
            (0, chai_1.expect)((0, utils_1.scalarToHex)(curve.prime(), curve)).to.equal((0, test_helpers_1.hexString)("ffffffff ffffffff ffffffff ffffffff" +
                "ffffffff ffffffff fffffffe fffffc2f"));
        });
    });
    describe("degree()", function () {
        context("with curve secp256k1", function () {
            it("assigns the correct sjcl curve", function () {
                var curve = new curve_1.Curve("k256");
                (0, chai_1.expect)(curve.degree()).to.equal(256);
            });
        });
        context("with curve secp256r1", function () {
            it("assigns the correct sjcl curve", function () {
                var curve = new curve_1.Curve("c256");
                (0, chai_1.expect)(curve.degree()).to.equal(256);
            });
        });
        context("with curve secp384r1", function () {
            it("assigns the correct sjcl curve", function () {
                var curve = new curve_1.Curve("c384");
                (0, chai_1.expect)(curve.degree()).to.equal(384);
            });
        });
        context("with curve secp521r1", function () {
            it("assigns the correct sjcl curve", function () {
                var curve = new curve_1.Curve("c521");
                (0, chai_1.expect)(curve.degree()).to.equal(521);
            });
        });
    });
    describe("a()", function () {
        it("returns the correct value", function () {
            var name = "k256";
            var curve = new curve_1.Curve(name);
            (0, chai_1.expect)((0, utils_1.scalarToHex)(curve.a(), curve)).to.equal((0, test_helpers_1.hexString)("00000000 00000000 00000000 00000000" +
                "00000000 00000000 00000000 00000000"));
        });
    });
    describe("b()", function () {
        it("returns the correct value", function () {
            var name = "k256";
            var curve = new curve_1.Curve(name);
            (0, chai_1.expect)((0, utils_1.scalarToHex)(curve.b(), curve)).to.equal((0, test_helpers_1.hexString)("00000000 00000000 00000000 00000000" +
                "00000000 00000000 00000000 00000007"));
        });
    });
    describe("G()", function () {
        it("returns the correct value", function () {
            var name = "k256";
            var curve = new curve_1.Curve(name);
            (0, chai_1.expect)((0, utils_1.pointToHex)(curve.G())).to.equal((0, test_helpers_1.hexString)("02" +
                "79be667e f9dcbbac 55a06295 ce870b07" +
                "029bfcdb 2dce28d9 59f2815b 16f81798"));
        });
        context("with curve secp256r1", function () {
            var name = "c256";
            var curve = new curve_1.Curve(name);
            it("returns the correct value", function () {
                (0, chai_1.expect)((0, utils_1.pointToHex)(curve.G())).to.equal((0, test_helpers_1.hexString)("03" +
                    "6b17d1f2 e12c4247 f8bce6e5 63a440f2" +
                    "77037d81 2deb33a0 f4a13945 d898c296"));
            });
        });
        context("with curve secp384r1", function () {
            var name = "c384";
            var curve = new curve_1.Curve(name);
            it("returns the correct value", function () {
                (0, chai_1.expect)((0, utils_1.pointToHex)(curve.G())).to.equal((0, test_helpers_1.hexString)("03" +
                    "aa87ca22 be8b0537 8eb1c71e f320ad74" +
                    "6e1d3b62 8ba79b98 59f741e0 82542a38" +
                    "5502f25d bf55296c 3a545e38 72760ab7"));
            });
        });
        context("with curve secp521r1", function () {
            var name = "c521";
            var curve = new curve_1.Curve(name);
            it("returns the correct value", function () {
                (0, chai_1.expect)((0, utils_1.pointToHex)(curve.G())).to.equal((0, test_helpers_1.hexString)("0200c6" +
                    "858e06b7 0404e9cd 9e3ecb66 2395b442" +
                    "9c648139 053fb521 f828af60 6b4d3dba" +
                    "a14b5e77 efe75928 fe1dc127 a2ffa8de" +
                    "3348b3c1 856a429b f97e7e31 c2e5bd66"));
            });
        });
    });
    describe("sha()", function () {
        context("with curve secp256k1", function () {
            it("returns the correct sha", function () {
                var curve = new curve_1.Curve("k256");
                (0, chai_1.expect)(curve.sha()).to.exist;
                (0, chai_1.expect)(curve.sha()).to.equal(sjcl.hash.sha256);
            });
        });
        context("with curve secp256r1", function () {
            it("assigns the correct sha", function () {
                var curve = new curve_1.Curve("c256");
                (0, chai_1.expect)(curve.sha()).to.exist;
                (0, chai_1.expect)(curve.sha()).to.equal(sjcl.hash.sha256);
            });
        });
        // SJCL doesn't support SHA384
        context("with curve secp384r1", function () {
            it("assigns the correct sha", function () {
                var curve = new curve_1.Curve("c384");
                (0, chai_1.expect)(curve.sha()).to.exist;
                (0, chai_1.expect)(curve.sha()).to.equal(sha384_1.SHA384);
            });
        });
        context("with curve secp521r1", function () {
            it("assigns the correct sha", function () {
                var curve = new curve_1.Curve("c521");
                (0, chai_1.expect)(curve.sha()).to.exist;
                (0, chai_1.expect)(curve.sha()).to.be.equal(sjcl.hash.sha512);
            });
        });
    });
    describe("scalarHexPrimitive()", function () {
        it("returns the correct value", function () {
            var name = "k256";
            var curve = new curve_1.Curve(name);
            (0, chai_1.expect)(curve.scalarHexPrimitive().source).to.equal('([a-f0-9]{64})');
        });
    });
    describe("pointHexPrimitive()", function () {
        it("returns the correct value", function () {
            var name = "k256";
            var curve = new curve_1.Curve(name);
            (0, chai_1.expect)(curve.pointHexPrimitive().source).to.equal('((?:02|03)([a-f0-9]{64})|00)');
        });
    });
    describe("scalarHexPattern()", function () {
        it("returns the correct value", function () {
            var name = "k256";
            var curve = new curve_1.Curve(name);
            (0, chai_1.expect)(curve.scalarHexPattern().source).to.equal('^([a-f0-9]{64})$');
        });
    });
    describe("pointHexPattern()", function () {
        it("returns the correct value", function () {
            var name = "k256";
            var curve = new curve_1.Curve(name);
            (0, chai_1.expect)(curve.pointHexPattern().source).to.equal('^((?:02|03)([a-f0-9]{64})|00)$');
        });
    });
    describe("scalarHexSize()", function () {
        it("returns the correct value", function () {
            var name = "k256";
            var curve = new curve_1.Curve(name);
            (0, chai_1.expect)(curve.scalarHexSize()).to.equal(64);
        });
    });
});
//# sourceMappingURL=curve.test.js.map