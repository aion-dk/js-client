import { expect } from "chai";
import {Curve} from "../../lib/av_crypto/curve";
import {hexToPoint, infinityPoint, pointToHex} from "../../lib/av_crypto/utils";
import {fixedPoint1, fixedPoint2, hexString} from "./test_helpers";
import {Encoder} from "../../lib/av_crypto/encoder";

describe("Encoder", () => {
  const curve = new Curve("k256")
  const encoder = new Encoder(curve)

  describe("constructor", () => {
    it ("constructs an encoder", () => {
      expect(encoder.pointEncodingByteSize).to.equal(31)
    })

    context("with curve secp256r1", () => {
      const curve = new Curve("c256")
      const encoder = new Encoder(curve)

      it ("constructs an encoder", () => {
        expect(encoder.pointEncodingByteSize).to.equal(31)
      })
    })

    context("with curve secp384r1", () => {
      const curve = new Curve("c384")
      const encoder = new Encoder(curve)

      it ("constructs an encoder", () => {
        expect(encoder.pointEncodingByteSize).to.equal(47)
      })
    })

    context("with curve secp521r1", () => {
      const curve = new Curve("c521")
      const encoder = new Encoder(curve)

      it ("constructs an encoder", () => {
        expect(encoder.pointEncodingByteSize).to.equal(64)
      })
    })
  })

  describe("bytesToPoints()", () => {
    const bytes = [1, 2, 3]

    it("produces deterministic points", () => {
      const points = encoder.bytesToPoints(bytes)

      expect(points.length).to.be.equal(1);
      expect(pointToHex(points[0])).to.eql(hexString(
        "02" +
        "01010203 00000000 00000000 00000000" +
        "00000000 00000000 00000000 00000000"
      ))
    })

    context("with max amount of bytes for one point", () => {
      const bytes = Array.from(Array(31).keys())

      it("produces one point", () => {
        const points = encoder.bytesToPoints(bytes)

        expect(points.length).to.be.equal(1);
      })
    })

    context("with bytes that fit in two points", () => {
      const bytes = Array.from(Array(32).keys())

      it("produces two points", () => {
        const points = encoder.bytesToPoints(bytes)

        expect(points.length).to.be.equal(2);
      })
    })

    context("when bytes have max value", () => {
      const bytes = Array(31).fill(255);

      it("produces one point", () => {
        const points = encoder.bytesToPoints(bytes)

        expect(points.length).to.be.equal(1);
      })
    })

    context("with byte too high", () => {
      const bytes = [256]

      it("throws error", () => {
        expect(() => {
          encoder.bytesToPoints(bytes)
        }).to.throw("input must be an array of bytes (between 0 and 255)")
      })
    })

    context("with negative byte", () => {
      const bytes = [-10]

      it("throws error", () => {
        expect(() => {
          encoder.bytesToPoints(bytes)
        }).to.throw("input must be an array of bytes (between 0 and 255)")
      })
    })

    context("with empty byte array", () => {
      const bytes = []

      it("produces no points", () => {
        const points = encoder.bytesToPoints(bytes)

        expect(points.length).to.be.equal(0);
      })
    })

    context("with curve secp521r1", () => {
      const curve = new Curve("c521")
      const encoder = new Encoder(curve)

      it("produces deterministic points", () => {
        const points = encoder.bytesToPoints(bytes)

        expect(points.length).to.be.equal(1);
        expect(pointToHex(points[0])).to.eql(hexString(
          "020001" +
          "01020300 00000000 00000000 00000000" +
          "00000000 00000000 00000000 00000000" +
          "00000000 00000000 00000000 00000000" +
          "00000000 00000000 00000000 00000000"
        ))
      })
    })
  })

  describe("pointsToBytes()", () => {
    const points = [fixedPoint1(curve)]

    it("decodes an array of bytes", () => {
      const bytes = encoder.pointsToBytes(points)

      expect(bytes.length).to.be.equal(31);
    })

    context("with a specific point", () => {
      const hex = hexString(
        "02" +
        "01010203 00000000 00000000 00000000" +
        "00000000 00000000 00000000 00000000"
      )
      const point = hexToPoint(hex, curve)
      const points = [point]

      it("decodes the right bytes", () => {
        const bytes = encoder.pointsToBytes(points)
        const expectedBytes = [1, 2, 3].concat(Array(28).fill(0))

        expect(bytes).to.be.eql(expectedBytes);
      })
    })

    context("with multiple points", () => {
      const points = [fixedPoint1(curve), fixedPoint2(curve)]

      it("decodes an array of bytes", () => {
        const bytes = encoder.pointsToBytes(points)

        expect(bytes.length).to.be.equal(62);
      })
    })

    context("with the infinity point", () => {
      const points = [infinityPoint(curve)]

      it("throws error", () => {
        expect(() => {
          encoder.pointsToBytes(points)
        }).to.throw("unable to decode infinity point")
      })
    })

    context("with curve secp521r1", () => {
      const curve = new Curve("c521")
      const encoder = new Encoder(curve)
      const points = [fixedPoint1(curve)]

      it("decodes an array of bytes", () => {
        const bytes = encoder.pointsToBytes(points)

        expect(bytes.length).to.be.equal(64);
      })
    })
  })
})
