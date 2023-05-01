import { expect } from "chai";
import {Curve} from "../../lib/av_crypto/curve";
import {fixedPoint1, fixedPoint2, hexString} from "./test_helpers";
import {
  addPoints,
  hashIntoScalar, hexToPoint, hexToScalar,
  infinityPoint,
  pointEquals,
  pointToHex,
  scalarToHex
} from "../../lib/av_crypto/utils";
import * as sjcl from "sjcl-with-all";

describe("AVCrypto Utils", () => {
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
      const scalar = curve.order();

      expect(scalarToHex(scalar, curve)).to.equal(hexString(
        "ffffffff ffffffff ffffffff fffffffe" +
        "baaedce6 af48a03b bfd25e8c d0364141"
      ))
    })

    context("with a small scalar", () => {
      const scalar = new sjcl.bn(42);

      expect(scalarToHex(scalar, curve)).to.equal(hexString(
        "00000000 00000000 00000000 00000000" +
        "00000000 00000000 00000000 0000002a"
      ))
    })
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
})
