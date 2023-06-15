import { expect } from "chai";
import {Curve} from "../../lib/av_crypto/curve";
import {fixedPoint1, fixedPoint2, fixedScalar1, hexString} from "./test_helpers";
import {
  addPoints, concatForHashing, generateKeyPair, hashIntoPoint,
  hashIntoScalar, hexToPoint, hexToScalar,
  infinityPoint, multiplyAndSumScalarsAndPoints,
  pointEquals,
  pointToHex,
  scalarToHex
} from "../../lib/av_crypto/utils";
import * as sjcl from "sjcl-with-all";

describe("AVCrypto utils", () => {
  const curve = new Curve('k256');

  describe("addPoints()", () => {
    it("returns the correct point", () => {
      const point1 = fixedPoint1(curve)
      const point2 = fixedPoint2(curve)

      const result = addPoints([point1, point2])
      const expected =  point1.toJac().add(point2).toAffine()

      expect(pointEquals(result, expected)).to.be.true;
    })

    context("with one value", () => {
      it("returns same value", () => {
        const point = fixedPoint1(curve)
        const result = addPoints([point])

        expect(pointEquals(result, point)).to.be.true;
      })
    })

    context("with empty array", () => {
      it("throws error", () => {
        expect(() => {
          addPoints([])
        }).to.throw("array must not be empty")
      })
    })
  })

  describe("multiplyAndSumScalarsAndPoints()", () => {
    const curve = new Curve('k256');
    const pointG = curve.G()
    const point2G = curve.G().mult(new sjcl.bn(2))
    const scalar1 = new sjcl.bn(10)
    const scalar2 = new sjcl.bn(42)

    it("returns the correct point", () => {
      const scalars = [scalar1, scalar2]
      const points = [pointG, point2G]

      const result = multiplyAndSumScalarsAndPoints(scalars, points)
      const expected = curve.G().mult(new sjcl.bn(10 + 42 * 2))

      expect(pointEquals(result, expected)).to.be.true;
    })

    context("with one value", () => {
      it("returns the correct point", () => {
        const result = multiplyAndSumScalarsAndPoints([scalar1], [pointG])
        const expected = curve.G().mult(new sjcl.bn(10))

        expect(pointEquals(result, expected)).to.be.true;
      })
    })

    context("with different size scalars and points", () => {
      const scalars = [scalar1]
      const points = [pointG, point2G]


      it("throws error", () => {
        expect(() => {
          multiplyAndSumScalarsAndPoints(scalars, points)
        }).to.throw("scalars and points must have the same size")
      })
    })
  })

  describe("pointEquals()", () => {
    context("with equal points", () => {
      const point1 = fixedPoint1(curve)
      const point2 = fixedPoint1(curve)

      it("returns true", () => {
        expect(pointEquals(point1, point2)).to.be.true;
      });
    })

    context("with same point", () => {
      const point1 = fixedPoint1(curve)

      it("returns true", () => {
        expect(pointEquals(point1, point1)).to.be.true;
      });
    })

    context("with infinity points", () => {
      const point1 = infinityPoint(curve);
      const point2 = infinityPoint(curve);

      it("returns true", () => {
        expect(pointEquals(point1, point2)).to.be.true;
      });
    })

    context("with one infinity point", () => {
      const point1 = infinityPoint(curve);
      const point2 = fixedPoint1(curve);

      it("returns false", () => {
        expect(pointEquals(point1, point2)).to.be.false;
        expect(pointEquals(point2, point1)).to.be.false;
      });
    })

    context("with different points", () => {
      const point1 = fixedPoint1(curve)
      const point2 = fixedPoint2(curve)

      it("returns false", () => {
        expect(pointEquals(point1, point2)).to.be.false;
      });
    })
  })

  describe("infinityPoint()", () => {
    const point = infinityPoint(curve)
    it ("returns the correct point", () => {
      expect(point.isIdentity).to.be.true
    })
  })

  describe("hashIntoScalar()", () => {
    const string = "hello"

    it ("produces a deterministic scalar", ()=> {
      const scalar = hashIntoScalar(string, curve)

      expect(scalarToHex(scalar, curve)).to.equal(hexString(
        "15f74e91 b37dec33 1de6d542 aa2dd643" +
        "82cc7f95 e66deb3d 01fb772f 21d6ddf5"
      ));
    })

    context("with curve secp384r1", () => {
      const curve = new Curve('c384');

      it ("produces a deterministic scalar", () => {
        const scalar = hashIntoScalar(string, curve)

        expect(scalarToHex(scalar, curve)).to.equal(hexString(
          "54721188 e23e419c 5ca9f9b0 18a5b3aa" +
          "bcd6dbc0 5fafe2c8 9eb95405 1e0a8f82" +
          "305522eb 14a9e889 27f1c924 1cbf750e"
        ));
      })
    })

    context("with curve secp521r1", () => {
      const curve = new Curve('c521');

      it ("produces a deterministic scalar", () => {
        const scalar = hashIntoScalar(string, curve)

        expect(scalarToHex(scalar, curve)).to.equal(hexString(
          "0000" +
          "078d899f c0d76556 a5fc8fec b59581d3" +
          "244ab042 667411ef 65e21295 a6cc99b9" +
          "96d82aaa d6968655 6b9e444d 47bbd038" +
          "0d215c35 3c153489 eddf2a6c 4e3558c2"
        ));
      })
    })
  })

  describe("hashIntoPoint()", () => {
    const string = "hello"

    it ("produces a deterministic point", ()=> {
      const point = hashIntoPoint(string, curve)

      expect(pointToHex(point)).to.equal(hexString(
        "02" +
        "93bd07f0 7300b787 8f910d64 b2cf63d4" +
        "864aeaed e343c292 98ce38af fe920bc0"
      ));
    })

    context("with curve secp384r1", () => {
      const curve = new Curve('c384');

      it ("produces a deterministic point", () => {
        const point = hashIntoPoint(string, curve)

        expect(pointToHex(point)).to.equal(hexString(
          "02" +
          "121cf2f2 663f9bb6 54e496d3 e176932d" +
          "478bb0b0 b5fa32a5 fafad522 8e10ae47" +
          "8bcee2aa 83b62d4e 146b2965 8b6e266c"
        ));
      })
    })

    context("with curve secp521r1", () => {
      const curve = new Curve('c521');

      it ("produces a deterministic point", () => {
        const point = hashIntoPoint(string, curve)

        expect(pointToHex(point)).to.equal(hexString(
          "020000" +
          "078d899f c0d76556 a5fc8fec b59581d3" +
          "244ab042 667411ef 65e21295 a6cc99b9" +
          "96d82aaa d6968655 6b9e444d 47bbd038" +
          "0d215c35 3c153489 eddf2a6c 4e3558c2"
        ));
      })
    })
  })

  describe("pointToHex()", () => {
    it("encodes the correct hex", () => {
      const point = curve.G();

      expect(pointToHex(point)).to.equal(hexString(
        "02" +
        "79be667e f9dcbbac 55a06295 ce870b07" +
        "029bfcdb 2dce28d9 59f2815b 16f81798"
      ))
    });

    context("with infinity point", () => {
      it("encodes the correct hex", () => {
        const point = infinityPoint(curve);

        expect(pointToHex(point)).to.equal("00")
      });
    })

    context("with curve secp521r1", () => {
      const curve = new Curve('c521');

      it ("produces a deterministic scalar", () => {
        const point = curve.G();

        expect(pointToHex(point)).to.equal(hexString(
          "0200c6" +
          "858e06b7 0404e9cd 9e3ecb66 2395b442" +
          "9c648139 053fb521 f828af60 6b4d3dba" +
          "a14b5e77 efe75928 fe1dc127 a2ffa8de" +
          "3348b3c1 856a429b f97e7e31 c2e5bd66"
        ))
      })
    })
  })

  describe("hexToPoint()", () => {
    it("decodes the correct point", () => {
      const hex = hexString(
        "02" +
        "79be667e f9dcbbac 55a06295 ce870b07" +
        "029bfcdb 2dce28d9 59f2815b 16f81798"
      )
      const point = hexToPoint(hex, curve)

      expect(pointEquals(point, curve.G())).to.be.true
    })

    context("with the encoding of the infinity point", () => {
      it("decodes the correct point", () => {
        const hex = "00"
        const point = hexToPoint(hex, curve)

        expect(point.isIdentity).to.be.true
      });
    })

    context("with a non-hex", () => {
      const string = "hello"

      it("throws error", () => {
        expect(() => {
          hexToPoint(string, curve)
        }).to.throw("input must match " + curve.pointHexPattern().source)
      })
    })

    context("with an incorrect prefix", () => {
      const string = hexString(
        "04" +
        "79be667e f9dcbbac 55a06295 ce870b07" +
        "029bfcdb 2dce28d9 59f2815b 16f81798"
      )

      it("throws error", () => {
        expect(() => {
          hexToPoint(string, curve)
        }).to.throw("input must match " + curve.pointHexPattern().source)
      })
    })

    context("with an incorrect amount of bytes", () => {
      const string = hexString(
        "02" +
        "79be667e f9dcbbac 55a06295 ce870b07" +
        "029bfcdb 2dce28d9 59f2815b 16f81798" +
        "483ada77 26a3c465 5da4fbfc 0e1108a8" +
        "fd17b448 a6855419 9c47d08f fb10d4b8"
      )

      it("throws error", () => {
        expect(() => {
          hexToPoint(string, curve)
        }).to.throw("input must match " + curve.pointHexPattern().source)
      })
    })

    context("with a value that doesn't encode a valid point", () => {
      // last byte is changed form 0x98 to 0x96
      const string = hexString(
        "02" +
        "79be667e f9dcbbac 55a06295 ce870b07" +
        "029bfcdb 2dce28d9 59f2815b 16f81796"
      )

      it("throws error", () => {
        expect(() => {
          hexToPoint(string, curve)
        }).to.throw("not on the curve")
      })
    })
  })

  describe("scalarToHex()", () => {
    it("encodes the correct value", () => {
      const scalar = fixedScalar1(curve);
      const hex = scalarToHex(scalar, curve);

      expect(hex).to.equal(hexString(
        "384c99b4 bb217ca8 23fa158c 9a3e188f" +
        "bc76fead 356ff050 c681c370 87565973"
      ))
      expect(hex).to.match(curve.scalarHexPattern())
    })

    context("with a small scalar", () => {
      const scalar = new sjcl.bn(42);

      it("encodes the correct value", () => {
        const hex = scalarToHex(scalar, curve);

        expect(hex).to.equal(hexString(
          "00000000 00000000 00000000 00000000" +
          "00000000 00000000 00000000 0000002a"
        ))
        expect(hex).to.match(curve.scalarHexPattern())
      });

      context("with curve secp521r1", () => {
        const curve = new Curve('c521');

        it ("encodes the correct value", () => {
          const hex = scalarToHex(scalar, curve);

          expect(hex).to.equal(hexString(
            "0000" +
            "00000000 00000000 00000000 00000000" +
            "00000000 00000000 00000000 00000000" +
            "00000000 00000000 00000000 00000000" +
            "00000000 00000000 00000000 0000002a"
          ));
          expect(hex).to.match(curve.scalarHexPattern())
        })
      })
    });

  })

  describe("hexToScalar()", () => {
    it("decodes the correct scalar", () => {
      const hex = hexString(
        "2cf24dba 5fb0a30e 26e83b2a c5b9e29e" +
        "1b161e5c 1fa7425e 73043362 938b9820"
      )
      const scalar = sjcl.bn.fromBits(sjcl.codec.hex.toBits(hexString(
        "2cf24dba 5fb0a30e 26e83b2a c5b9e29e" +
        "1b161e5c 1fa7425e 73043362 938b9820"
      )))

      expect(hexToScalar(hex, curve)).to.eql(scalar)
    })

    context("with a non-hex", () => {
      const string = "hello"

      it("throws error", () => {
        expect(() => {
          hexToScalar(string, curve)
        }).to.throw("input must match " + curve.scalarHexPattern().source)
      })
    })

    context("with an incorrect amount of bytes", () => {
      const string = "42"

      it("throws error", () => {
        expect(() => {
          hexToScalar(string, curve)
        }).to.throw("input must match " + curve.scalarHexPattern().source)
      })
    })

    context("with an encoding of a higher value than the order", () => {
      const string = hexString(
        "ffffffff ffffffff ffffffff ffffffff" +
        "ffffffff ffffffff ffffffff ffffffff"
      )

      it("throws error", () => {
        expect(() => {
          hexToScalar(string, curve)
        }).to.throw("scalar must be lower than the curve order")
      })
    })
  })

  describe("concatForHashing()", () => {
    const parts = ['hello', 1, "-world"]

    it ("returns the concatenated value", () => {
      expect(concatForHashing(parts)).to.equal("hello-1--world")
    })
  })

  describe("generateKeyPair()", () => {
    it("returns a sjcl key pair", () => {
      const keyPair = generateKeyPair(curve)

      expect(pointToHex(keyPair.pub.H)).to.match(curve.pointHexPattern());
      expect(scalarToHex(keyPair.sec.S, curve)).to.match(curve.scalarHexPattern());
    })

    context("when given a private key", () => {
      const privateKey = fixedScalar1(curve)

      it("returns a deterministic key pair", () => {
        const keyPair = generateKeyPair(curve, privateKey)

        expect(keyPair.pub.H).to.eql(fixedPoint1(curve));
        expect(keyPair.sec.S).to.eql(privateKey);
      })

      context("when given a private key that is larger than the curve's group order", () => {
        const privateKey = sjcl.bn.fromBits(sjcl.codec.hex.toBits(hexString(
          "ed" +
          "c11c291d 73e08c6a 92c6df55 e8c66094" +
          "9b35c4a0 0a027272 9e79aac7 fe37da11"
        )))

        it("throws error", () => {
          expect(() => {
            generateKeyPair(curve, privateKey)
          }).to.throw("privateKey must be lower than the curve order")
        })
      })
    })
  })
})