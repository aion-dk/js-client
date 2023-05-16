import { expect } from "chai";
import {Curve} from "../../lib/av_crypto/curve";
import {pointToHex} from "../../lib/av_crypto/utils";
import {hexString} from "./test_helpers";
import {Encoder} from "../../lib/av_crypto/encoder";

describe("Encoder", () => {
  const curve = new Curve("k256")
  const encoder = new Encoder(curve)

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
})
