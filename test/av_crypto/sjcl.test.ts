import { expect } from "chai";
import {fixedKeyPair, fixedPoint1, fixedPoint2, fixedScalar1, fixedScalar2, hexString} from "./test_helpers";
import sjcl = require("../../lib/av_crypto/sjcl/sjcl");
import {Curve} from "../../lib/av_crypto/curve";

describe("Enhanced SJCL utility functionality", () => {
  const curve = new Curve('k256');

  describe("point", () => {
    describe("add()", () => {
      it("returns the correct point", () => {
        const point1 = fixedPoint1(curve)
        const point2 = fixedPoint2(curve)

        const result = point1.add(point2)
        const expected = point1.toJac().add(point2).toAffine()

        expect(result.equals(expected)).to.be.true;
      })
    })

    describe("equals()", () => {
      context("with equal points", () => {
        const point1 = fixedPoint1(curve)
        const point2 = fixedPoint1(curve)

        it("returns true", () => {
          expect(point1).to.eql(point2);
          expect(point1.equals(point2)).to.be.true;
        });
      })

      context("with same point", () => {
        const point1 = fixedPoint1(curve)

        it("returns true", () => {
          expect(point1).to.eql(point1);
        });
      })

      context("with infinity points", () => {
        const point1 = new sjcl.ecc.point(curve.curve());
        const point2 = new sjcl.ecc.point(curve.curve());

        it("returns true", () => {
          expect(point1).to.eql(point2);
        });
      })

      context("with one infinity point", () => {
        const point1 = new sjcl.ecc.point(curve.curve());
        const point2 = fixedPoint1(curve);

        it("returns false", () => {
          expect(point1.equals(point2)).to.be.false;
          expect(point2.equals(point1)).to.be.false;
        });
      })

      context("with different points", () => {
        const point1 = fixedPoint1(curve)
        const point2 = fixedPoint2(curve)

        it("returns false", () => {
          expect(point1).to.not.eql(point2);
        });
      })
    })

    describe("toBits()", () => {
      const point = curve.G();

      context("with compressed true", () => {
        const compressed = true;
        it("encodes the correct bits", () => {
          const expected = sjcl.codec.hex.toBits(hexString(
            "02" +
            "79be667e f9dcbbac 55a06295 ce870b07" +
            "029bfcdb 2dce28d9 59f2815b 16f81798"
          ))

          expect(point.toBits(compressed)).to.eql(expected);
        });
      })

      context("with compressed false", () => {
        const compressed = false;
        it("encodes the correct bits", () => {
          const expected = sjcl.codec.hex.toBits(hexString(
            "04" +
            "79be667e f9dcbbac 55a06295 ce870b07" +
            "029bfcdb 2dce28d9 59f2815b 16f81798" +
            "483ada77 26a3c465 5da4fbfc 0e1108a8" +
            "fd17b448 a6855419 9c47d08f fb10d4b8"
          ))

          expect(point.toBits(compressed)).to.eql(expected);
        });
      })

      context("without compressed", () => {
        it("encodes the correct bits", () => {
          const expected = sjcl.codec.hex.toBits(hexString(
            "04" +
            "79be667e f9dcbbac 55a06295 ce870b07" +
            "029bfcdb 2dce28d9 59f2815b 16f81798" +
            "483ada77 26a3c465 5da4fbfc 0e1108a8" +
            "fd17b448 a6855419 9c47d08f fb10d4b8"
          ))

          expect(point.toBits()).to.eql(expected);
        });
      })

      context("with infinity point", () => {
        it("encodes the correct hex", () => {
          const point = new sjcl.ecc.point(curve.curve());
          const expected = new sjcl.bn(0).toBits(8);

          expect(point.toBits()).to.eql(expected)
          expect(sjcl.codec.hex.fromBits(point.toBits())).to.equal("00")
        });
      })
    })
  })

  describe("curve", () => {
    const curve = sjcl.ecc.curves.k256;
    describe("infinity()", () => {
      it("returns the correct point", () => {
        const point = new sjcl.ecc.point(curve)

        expect(curve.infinity()).to.eql(point)
      })
    })

    describe("fromBits()", () => {
      it("decodes the correct point", () => {
        const bits = sjcl.codec.hex.toBits(hexString(
          "02" +
          "79be667e f9dcbbac 55a06295 ce870b07" +
          "029bfcdb 2dce28d9 59f2815b 16f81798"
        ))
        const point = curve.fromBits(bits)

        expect(point.equals(curve.G)).to.be.true
      })

      context("with a 03 flag", () => {
        it("decodes the correct point", () => {
          const bits = sjcl.codec.hex.toBits(hexString(
            "03" +
            "79be667e f9dcbbac 55a06295 ce870b07" +
            "029bfcdb 2dce28d9 59f2815b 16f81798"
          ))
          const point = curve.fromBits(bits)

          expect(point.equals(curve.G.negate())).to.be.true
        })
      })

      context("with the encoding of the infinity point", () => {
        it("decodes the correct point", () => {
          const bits = new sjcl.bn().toBits(8);
          const point = curve.fromBits(bits)

          expect(point).to.eql(curve.infinity())
        })
      })

      context.skip("with a 04 flag", () => {
        // we don't use this encoding, but it is technically possible
      })

      context("with too many bytes", () => {
        const bits = sjcl.codec.hex.toBits(hexString(
          "03" +
          "79be667e f9dcbbac 55a06295 ce870b07" +
          "029bfcdb 2dce28d9 59f2815b 16f81798" +
          "483ada77 26a3c465 5da4fbfc 0e1108a8" +
          "fd17b448 a6855419 9c47d08f fb10d4b8"
        ))
          it("throws error", () => {
            // const point = curve.fromBits(bits)
            expect(() => {
              curve.fromBits(bits)
            }).to.throw("not on the curve")
          })
        })

      context("with too few bytes", () => {
        const bits = sjcl.codec.hex.toBits(hexString(
          "03" +
          "79be667e f9dcbbac 55a06295 ce870b07"
        ))
        it("throws error", () => {
          // const point = curve.fromBits(bits)
          expect(() => {
            curve.fromBits(bits)
          }).to.throw("not on the curve")
        })
      })

      context("with a value that doesn't encode a valid point", () => {
        // last byte is changed form 0x98 to 0x96
        const bits = sjcl.codec.hex.toBits(hexString(
          "02" +
          "79be667e f9dcbbac 55a06295 ce870b07" +
          "029bfcdb 2dce28d9 59f2815b 16f81796"
        ))

        it("throws error", () => {
          expect(() => {
            curve.fromBits(bits)
          }).to.throw("not on the curve")
        })
      })

      context("with a wrong flag", () => {
        // last byte is changed form 0x98 to 0x96
        const bits = sjcl.codec.hex.toBits(hexString(
          "05" +
          "79be667e f9dcbbac 55a06295 ce870b07" +
          "029bfcdb 2dce28d9 59f2815b 16f81798"
        ))

        it("throws error", () => {
          expect(() => {
            curve.fromBits(bits)
          }).to.throw("corrupt encoding")
        })
      })
    })
  })
})

describe("Extra AV functionality on top of SJCL", () => {
  const curve = new Curve('k256');

  describe("elGamalEncryption", () => {

    describe("generateKeyPair()", () => {
      it("returns a key pair", () => {
        const keyPair = sjcl.ecc.elGamalEncryption.generateKeys(curve.curve())

        expect(keyPair).to.exist;
      })

      context("with a fixed private key", () => {
        const privateKey = fixedScalar1(curve)

        it("returns a deterministic key pair", () => {
          const keyPair = sjcl.ecc.elGamalEncryption.generateKeys(
            curve.curve(),
            undefined,
            privateKey);

          expect(keyPair.pub._point).to.eql(fixedPoint1(curve))
        })
      })
    })

    describe("encrypt()", () => {
      it("returns a cryptogram", () => {
        const keyPair = sjcl.ecc.elGamalEncryption.generateKeys(curve.curve())
        const message = fixedPoint2(curve)
        const cryptogram = keyPair.pub.encrypt(message)

        expect(cryptogram).to.exist;
      })

      context("with a fixed message and randomness", () => {
        const keyPair = sjcl.ecc.elGamalEncryption.generateKeys(
          curve.curve(),
          undefined,
          fixedScalar1(curve)
        )
        const message = fixedPoint2(curve)
        const randomness = fixedKeyPair(curve, 'elGamalEncryption').sec._exponent

        it("returns a deterministic cryptogram", () => {
          const cryptogram = keyPair.pub.encrypt(message, randomness)
          const bits = cryptogram.toBits();
          const expectedR = sjcl.codec.hex.toBits(hexString(
            "03" +
            "fdb56f2d 282189d5 592305cc cc5ba3f3" +
            "b9e2d6a8 f373b436 4a7a20e1 54bac1b1"
          ))
          const expectedC = sjcl.codec.hex.toBits(hexString(
            "03" +
            "16b19bac 2033c9d5 63d0399d 26bfd10b" +
            "a3cba736 aad9fa98 e4daad13 4bd07911"
          ))

          expect(bits.r).to.eql(expectedR)
          expect(bits.c).to.eql(expectedC)
        })
      })
    })
  })
})
