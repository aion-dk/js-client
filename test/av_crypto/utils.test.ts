import { expect } from "chai";
import {Curve} from "../../lib/av_crypto/curve";
import {fixedPoint1, fixedPoint2, hexString} from "./test_helpers";
import {
  hashIntoScalar
} from "../../lib/av_crypto/utils";
import sjcl = require("../../lib/av_crypto/sjcl/sjcl");

describe("AVCrypto Utils", () => {
  const curve = new Curve('k256');

  describe("hashIntoScalar()", () => {
    const string = "hello"

    it ("produces a deterministic scalar", ()=> {
      const scalar = hashIntoScalar(string, curve)

      expect(scalar.toBits()).to.eql(sjcl.codec.hex.toBits(hexString(
        "15f74e91 b37dec33 1de6d542 aa2dd643" +
        "82cc7f95 e66deb3d 01fb772f 21d6ddf5"
      )));
    })
  })
})
