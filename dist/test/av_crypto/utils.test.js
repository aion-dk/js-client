"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var curve_1 = require("../../lib/av_crypto/curve");
var test_helpers_1 = require("./test_helpers");
var utils_1 = require("../../lib/av_crypto/utils");
var sjcl = require("sjcl-with-all");
describe("AVCrypto utils", function () {
    var curve = new curve_1.Curve('k256');
    describe("addPoints()", function () {
        it("returns the correct point", function () {
            var point1 = (0, test_helpers_1.fixedPoint1)(curve);
            var point2 = (0, test_helpers_1.fixedPoint2)(curve);
            var result = (0, utils_1.addPoints)([point1, point2]);
            var expected = point1.toJac().add(point2).toAffine();
            (0, chai_1.expect)((0, utils_1.pointEquals)(result, expected)).to.be.true;
        });
        context("with one value", function () {
            it("returns same value", function () {
                var point = (0, test_helpers_1.fixedPoint1)(curve);
                var result = (0, utils_1.addPoints)([point]);
                (0, chai_1.expect)((0, utils_1.pointEquals)(result, point)).to.be.true;
            });
        });
        context("with empty array", function () {
            it("throws error", function () {
                (0, chai_1.expect)(function () {
                    (0, utils_1.addPoints)([]);
                }).to.throw("array must not be empty");
            });
        });
    });
    describe("multiplyAndSumScalarsAndPoints()", function () {
        var curve = new curve_1.Curve('k256');
        var pointG = curve.G();
        var point2G = curve.G().mult(new sjcl.bn(2));
        var scalar1 = new sjcl.bn(10);
        var scalar2 = new sjcl.bn(42);
        it("returns the correct point", function () {
            var scalars = [scalar1, scalar2];
            var points = [pointG, point2G];
            var result = (0, utils_1.multiplyAndSumScalarsAndPoints)(scalars, points);
            var expected = curve.G().mult(new sjcl.bn(10 + 42 * 2));
            (0, chai_1.expect)((0, utils_1.pointEquals)(result, expected)).to.be.true;
        });
        context("with one value", function () {
            it("returns the correct point", function () {
                var result = (0, utils_1.multiplyAndSumScalarsAndPoints)([scalar1], [pointG]);
                var expected = curve.G().mult(new sjcl.bn(10));
                (0, chai_1.expect)((0, utils_1.pointEquals)(result, expected)).to.be.true;
            });
        });
        context("with different size scalars and points", function () {
            var scalars = [scalar1];
            var points = [pointG, point2G];
            it("throws error", function () {
                (0, chai_1.expect)(function () {
                    (0, utils_1.multiplyAndSumScalarsAndPoints)(scalars, points);
                }).to.throw("scalars and points must have the same size");
            });
        });
    });
    describe("pointEquals()", function () {
        context("with equal points", function () {
            var point1 = (0, test_helpers_1.fixedPoint1)(curve);
            var point2 = (0, test_helpers_1.fixedPoint1)(curve);
            it("returns true", function () {
                (0, chai_1.expect)((0, utils_1.pointEquals)(point1, point2)).to.be.true;
            });
        });
        context("with same point", function () {
            var point1 = (0, test_helpers_1.fixedPoint1)(curve);
            it("returns true", function () {
                (0, chai_1.expect)((0, utils_1.pointEquals)(point1, point1)).to.be.true;
            });
        });
        context("with infinity points", function () {
            var point1 = (0, utils_1.infinityPoint)(curve);
            var point2 = (0, utils_1.infinityPoint)(curve);
            it("returns true", function () {
                (0, chai_1.expect)((0, utils_1.pointEquals)(point1, point2)).to.be.true;
            });
        });
        context("with one infinity point", function () {
            var point1 = (0, utils_1.infinityPoint)(curve);
            var point2 = (0, test_helpers_1.fixedPoint1)(curve);
            it("returns false", function () {
                (0, chai_1.expect)((0, utils_1.pointEquals)(point1, point2)).to.be.false;
                (0, chai_1.expect)((0, utils_1.pointEquals)(point2, point1)).to.be.false;
            });
        });
        context("with different points", function () {
            var point1 = (0, test_helpers_1.fixedPoint1)(curve);
            var point2 = (0, test_helpers_1.fixedPoint2)(curve);
            it("returns false", function () {
                (0, chai_1.expect)((0, utils_1.pointEquals)(point1, point2)).to.be.false;
            });
        });
    });
    describe("infinityPoint()", function () {
        var point = (0, utils_1.infinityPoint)(curve);
        it("returns the correct point", function () {
            (0, chai_1.expect)(point.isIdentity).to.be.true;
        });
    });
    describe("hashIntoScalar()", function () {
        var string = "hello";
        it("produces a deterministic scalar", function () {
            var scalar = (0, utils_1.hashIntoScalar)(string, curve);
            (0, chai_1.expect)((0, utils_1.scalarToHex)(scalar, curve)).to.equal((0, test_helpers_1.hexString)("15f74e91 b37dec33 1de6d542 aa2dd643" +
                "82cc7f95 e66deb3d 01fb772f 21d6ddf5"));
        });
        context("with curve secp384r1", function () {
            var curve = new curve_1.Curve('c384');
            it("produces a deterministic scalar", function () {
                var scalar = (0, utils_1.hashIntoScalar)(string, curve);
                (0, chai_1.expect)((0, utils_1.scalarToHex)(scalar, curve)).to.equal((0, test_helpers_1.hexString)("54721188 e23e419c 5ca9f9b0 18a5b3aa" +
                    "bcd6dbc0 5fafe2c8 9eb95405 1e0a8f82" +
                    "305522eb 14a9e889 27f1c924 1cbf750e"));
            });
        });
        context("with curve secp521r1", function () {
            var curve = new curve_1.Curve('c521');
            it("produces a deterministic scalar", function () {
                var scalar = (0, utils_1.hashIntoScalar)(string, curve);
                (0, chai_1.expect)((0, utils_1.scalarToHex)(scalar, curve)).to.equal((0, test_helpers_1.hexString)("0000" +
                    "078d899f c0d76556 a5fc8fec b59581d3" +
                    "244ab042 667411ef 65e21295 a6cc99b9" +
                    "96d82aaa d6968655 6b9e444d 47bbd038" +
                    "0d215c35 3c153489 eddf2a6c 4e3558c2"));
            });
        });
    });
    describe("hashIntoPoint()", function () {
        var string = "hello";
        it("produces a deterministic point", function () {
            var point = (0, utils_1.hashIntoPoint)(string, curve);
            (0, chai_1.expect)((0, utils_1.pointToHex)(point)).to.equal((0, test_helpers_1.hexString)("02" +
                "93bd07f0 7300b787 8f910d64 b2cf63d4" +
                "864aeaed e343c292 98ce38af fe920bc0"));
        });
        context("with curve secp384r1", function () {
            var curve = new curve_1.Curve('c384');
            it("produces a deterministic point", function () {
                var point = (0, utils_1.hashIntoPoint)(string, curve);
                (0, chai_1.expect)((0, utils_1.pointToHex)(point)).to.equal((0, test_helpers_1.hexString)("02" +
                    "121cf2f2 663f9bb6 54e496d3 e176932d" +
                    "478bb0b0 b5fa32a5 fafad522 8e10ae47" +
                    "8bcee2aa 83b62d4e 146b2965 8b6e266c"));
            });
        });
        context("with curve secp521r1", function () {
            var curve = new curve_1.Curve('c521');
            it("produces a deterministic point", function () {
                var point = (0, utils_1.hashIntoPoint)(string, curve);
                (0, chai_1.expect)((0, utils_1.pointToHex)(point)).to.equal((0, test_helpers_1.hexString)("020000" +
                    "078d899f c0d76556 a5fc8fec b59581d3" +
                    "244ab042 667411ef 65e21295 a6cc99b9" +
                    "96d82aaa d6968655 6b9e444d 47bbd038" +
                    "0d215c35 3c153489 eddf2a6c 4e3558c2"));
            });
        });
    });
    describe("pointToHex()", function () {
        it("encodes the correct hex", function () {
            var point = curve.G();
            (0, chai_1.expect)((0, utils_1.pointToHex)(point)).to.equal((0, test_helpers_1.hexString)("02" +
                "79be667e f9dcbbac 55a06295 ce870b07" +
                "029bfcdb 2dce28d9 59f2815b 16f81798"));
        });
        context("with infinity point", function () {
            it("encodes the correct hex", function () {
                var point = (0, utils_1.infinityPoint)(curve);
                (0, chai_1.expect)((0, utils_1.pointToHex)(point)).to.equal("00");
            });
        });
        context("with curve secp521r1", function () {
            var curve = new curve_1.Curve('c521');
            it("produces a deterministic scalar", function () {
                var point = curve.G();
                (0, chai_1.expect)((0, utils_1.pointToHex)(point)).to.equal((0, test_helpers_1.hexString)("0200c6" +
                    "858e06b7 0404e9cd 9e3ecb66 2395b442" +
                    "9c648139 053fb521 f828af60 6b4d3dba" +
                    "a14b5e77 efe75928 fe1dc127 a2ffa8de" +
                    "3348b3c1 856a429b f97e7e31 c2e5bd66"));
            });
        });
    });
    describe("hexToPoint()", function () {
        it("decodes the correct point", function () {
            var hex = (0, test_helpers_1.hexString)("02" +
                "79be667e f9dcbbac 55a06295 ce870b07" +
                "029bfcdb 2dce28d9 59f2815b 16f81798");
            var point = (0, utils_1.hexToPoint)(hex, curve);
            (0, chai_1.expect)((0, utils_1.pointEquals)(point, curve.G())).to.be.true;
        });
        context("with the encoding of the infinity point", function () {
            it("decodes the correct point", function () {
                var hex = "00";
                var point = (0, utils_1.hexToPoint)(hex, curve);
                (0, chai_1.expect)(point.isIdentity).to.be.true;
            });
        });
        context("with a non-hex", function () {
            var string = "hello";
            it("throws error", function () {
                (0, chai_1.expect)(function () {
                    (0, utils_1.hexToPoint)(string, curve);
                }).to.throw("input must match " + curve.pointHexPattern().source);
            });
        });
        context("with an incorrect prefix", function () {
            var string = (0, test_helpers_1.hexString)("04" +
                "79be667e f9dcbbac 55a06295 ce870b07" +
                "029bfcdb 2dce28d9 59f2815b 16f81798");
            it("throws error", function () {
                (0, chai_1.expect)(function () {
                    (0, utils_1.hexToPoint)(string, curve);
                }).to.throw("input must match " + curve.pointHexPattern().source);
            });
        });
        context("with an incorrect amount of bytes", function () {
            var string = (0, test_helpers_1.hexString)("02" +
                "79be667e f9dcbbac 55a06295 ce870b07" +
                "029bfcdb 2dce28d9 59f2815b 16f81798" +
                "483ada77 26a3c465 5da4fbfc 0e1108a8" +
                "fd17b448 a6855419 9c47d08f fb10d4b8");
            it("throws error", function () {
                (0, chai_1.expect)(function () {
                    (0, utils_1.hexToPoint)(string, curve);
                }).to.throw("input must match " + curve.pointHexPattern().source);
            });
        });
        context("with a value that doesn't encode a valid point", function () {
            // last byte is changed form 0x98 to 0x96
            var string = (0, test_helpers_1.hexString)("02" +
                "79be667e f9dcbbac 55a06295 ce870b07" +
                "029bfcdb 2dce28d9 59f2815b 16f81796");
            it("throws error", function () {
                (0, chai_1.expect)(function () {
                    (0, utils_1.hexToPoint)(string, curve);
                }).to.throw("not on the curve");
            });
        });
    });
    describe("scalarToHex()", function () {
        it("encodes the correct value", function () {
            var scalar = (0, test_helpers_1.fixedScalar1)(curve);
            var hex = (0, utils_1.scalarToHex)(scalar, curve);
            (0, chai_1.expect)(hex).to.equal((0, test_helpers_1.hexString)("384c99b4 bb217ca8 23fa158c 9a3e188f" +
                "bc76fead 356ff050 c681c370 87565973"));
            (0, chai_1.expect)(hex).to.match(curve.scalarHexPattern());
        });
        context("with a small scalar", function () {
            var scalar = new sjcl.bn(42);
            it("encodes the correct value", function () {
                var hex = (0, utils_1.scalarToHex)(scalar, curve);
                (0, chai_1.expect)(hex).to.equal((0, test_helpers_1.hexString)("00000000 00000000 00000000 00000000" +
                    "00000000 00000000 00000000 0000002a"));
                (0, chai_1.expect)(hex).to.match(curve.scalarHexPattern());
            });
            context("with curve secp521r1", function () {
                var curve = new curve_1.Curve('c521');
                it("encodes the correct value", function () {
                    var hex = (0, utils_1.scalarToHex)(scalar, curve);
                    (0, chai_1.expect)(hex).to.equal((0, test_helpers_1.hexString)("0000" +
                        "00000000 00000000 00000000 00000000" +
                        "00000000 00000000 00000000 00000000" +
                        "00000000 00000000 00000000 00000000" +
                        "00000000 00000000 00000000 0000002a"));
                    (0, chai_1.expect)(hex).to.match(curve.scalarHexPattern());
                });
            });
        });
    });
    describe("hexToScalar()", function () {
        it("decodes the correct scalar", function () {
            var hex = (0, test_helpers_1.hexString)("2cf24dba 5fb0a30e 26e83b2a c5b9e29e" +
                "1b161e5c 1fa7425e 73043362 938b9820");
            var scalar = sjcl.bn.fromBits(sjcl.codec.hex.toBits((0, test_helpers_1.hexString)("2cf24dba 5fb0a30e 26e83b2a c5b9e29e" +
                "1b161e5c 1fa7425e 73043362 938b9820")));
            (0, chai_1.expect)((0, utils_1.hexToScalar)(hex, curve)).to.eql(scalar);
        });
        context("with a non-hex", function () {
            var string = "hello";
            it("throws error", function () {
                (0, chai_1.expect)(function () {
                    (0, utils_1.hexToScalar)(string, curve);
                }).to.throw("input must match " + curve.scalarHexPattern().source);
            });
        });
        context("with an incorrect amount of bytes", function () {
            var string = "42";
            it("throws error", function () {
                (0, chai_1.expect)(function () {
                    (0, utils_1.hexToScalar)(string, curve);
                }).to.throw("input must match " + curve.scalarHexPattern().source);
            });
        });
        context("with an encoding of a higher value than the order", function () {
            var string = (0, test_helpers_1.hexString)("ffffffff ffffffff ffffffff ffffffff" +
                "ffffffff ffffffff ffffffff ffffffff");
            it("throws error", function () {
                (0, chai_1.expect)(function () {
                    (0, utils_1.hexToScalar)(string, curve);
                }).to.throw("scalar must be lower than the curve order");
            });
        });
    });
    describe("concatForHashing()", function () {
        var parts = ['hello', 1, "-world"];
        it("returns the concatenated value", function () {
            (0, chai_1.expect)((0, utils_1.concatForHashing)(parts)).to.equal("hello-1--world");
        });
    });
    describe("generateKeyPair()", function () {
        it("returns a sjcl key pair", function () {
            var keyPair = (0, utils_1.generateKeyPair)(curve);
            (0, chai_1.expect)((0, utils_1.pointToHex)(keyPair.pub.H)).to.match(curve.pointHexPattern());
            (0, chai_1.expect)((0, utils_1.scalarToHex)(keyPair.sec.S, curve)).to.match(curve.scalarHexPattern());
        });
        context("when given a private key", function () {
            var privateKey = (0, test_helpers_1.fixedScalar1)(curve);
            it("returns a deterministic key pair", function () {
                var keyPair = (0, utils_1.generateKeyPair)(curve, privateKey);
                (0, chai_1.expect)(keyPair.pub.H).to.eql((0, test_helpers_1.fixedPoint1)(curve));
                (0, chai_1.expect)(keyPair.sec.S).to.eql(privateKey);
            });
            context("when given a private key that is larger than the curve's group order", function () {
                var privateKey = sjcl.bn.fromBits(sjcl.codec.hex.toBits((0, test_helpers_1.hexString)("ed" +
                    "c11c291d 73e08c6a 92c6df55 e8c66094" +
                    "9b35c4a0 0a027272 9e79aac7 fe37da11")));
                it("throws error", function () {
                    (0, chai_1.expect)(function () {
                        (0, utils_1.generateKeyPair)(curve, privateKey);
                    }).to.throw("privateKey must be lower than the curve order");
                });
            });
        });
    });
});
//# sourceMappingURL=utils.test.js.map