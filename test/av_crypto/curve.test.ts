import { expect } from "chai";
import {Curve} from "../../lib/av_crypto/curve";
import * as sjcl from "../../lib/av_crypto/sjcl/sjcl";

describe("Curve", () => {
  describe("constructor", () => {
    it("constructs a Curve instance", () => {
      const name = "k256";
      const curve = new Curve(name)

      expect(curve).to.be.an.instanceof(Curve);
    })

    context("with invalid name", () => {
      it("throws error", () => {
        const name = "hello";

        expect(() => {
          new Curve(name)
        }).to.throw("curve name is invalid")
      })
    })
  })

  describe("curve()", () => {
    it("returns the correct sjcl curve", () => {
      const name = "k256";
      const curve = new Curve(name)

      expect(curve.curve()).to.equal(sjcl.ecc.curves.k256)
    })
  })
})
