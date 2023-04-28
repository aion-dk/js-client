import { expect } from "chai";
import {Curve} from "../../lib/av_crypto/curve";
import * as sjcl from "../../lib/av_crypto/sjcl/sjcl";
import {pointToHex, scalarToHex} from "../../lib/av_crypto/utils";
import {hexString} from "./test_helpers";

describe("Curve", () => {
  describe("constructor", () => {
    it("constructs a Curve instance", () => {
      const name = "k256";
      const curve = new Curve(name)

      expect(curve).to.be.an.instanceof(Curve);
    })

    context("with curve secp256k1", () => {
      it ("assigns the correct sjcl curve", () => {
        const curve = new Curve("k256")
        expect(curve.curve()).to.be.equal(sjcl.ecc.curves.k256)
      })
    })

    context("with curve secp256r1", () => {
      it ("assigns the correct sjcl curve", () => {
        const curve = new Curve("c256")
        expect(curve.curve()).to.be.equal(sjcl.ecc.curves.c256)
      })
    })

    context("with curve secp384r1", () => {
      it ("assigns the correct sjcl curve", () => {
        const curve = new Curve("c384")
        expect(curve.curve()).to.be.equal(sjcl.ecc.curves.c384)
      })
    })

    context("with curve secp521r1", () => {
      it ("assigns the correct sjcl curve", () => {
        const curve = new Curve("c521")
        expect(curve.curve()).to.be.equal(sjcl.ecc.curves.c521)
      })
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

  describe("order()", () => {
    it("returns the correct value", () => {
      const name = "k256";
      const curve = new Curve(name)

      expect(scalarToHex(curve.order(), curve)).to.equal(hexString(
        "ffffffff ffffffff ffffffff fffffffe" +
        "baaedce6 af48a03b bfd25e8c d0364141"
      ))
    })
  })

  describe("prime()", () => {
    it("returns the correct value", () => {
      const name = "k256";
      const curve = new Curve(name)

      expect(scalarToHex(curve.prime(), curve)).to.equal(hexString(
        "ffffffff ffffffff ffffffff ffffffff" +
        "ffffffff ffffffff fffffffe fffffc2f"
      ))
    })
  })

  describe("a()", () => {
    it("returns the correct value", () => {
      const name = "k256";
      const curve = new Curve(name)

      expect(scalarToHex(curve.a(), curve)).to.equal(hexString(
        "00000000 00000000 00000000 00000000" +
        "00000000 00000000 00000000 00000000"
      ))
    })
  })

  describe("b()", () => {
    it("returns the correct value", () => {
      const name = "k256";
      const curve = new Curve(name)

      expect(scalarToHex(curve.b(), curve)).to.equal(hexString(
        "00000000 00000000 00000000 00000000" +
        "00000000 00000000 00000000 00000007"
      ))
    })
  })

  describe("G()", () => {
    it("returns the correct value", () => {
      const name = "k256";
      const curve = new Curve(name)

      expect(pointToHex(curve.G())).to.equal(hexString(
        "02" +
        "79be667e f9dcbbac 55a06295 ce870b07" +
        "029bfcdb 2dce28d9 59f2815b 16f81798"
      ))
    })
  })

  describe("sha()", () => {
    context("with curve secp256k1", () => {
      it("returns the correct sha", () => {
        const curve = new Curve("k256")

        expect(curve.sha()).to.equal(sjcl.hash.sha256)
      })
    })

    context("with curve secp256r1", () => {
      it ("assigns the correct sha", () => {
        const curve = new Curve("c256")
        expect(curve.sha()).to.be.equal(sjcl.hash.sha256)
        expect(curve.sha()).to.exist
      })
    })

    // SJCL doesn't support SHA384
    // TODO: Figure out workaround
    context.skip("with curve secp384r1", () => {
      it ("assigns the correct sha", () => {
        const curve = new Curve("c384")
        // expect(curve.sha()).to.be.equal(sjcl.hash.sha384)
        expect(curve.sha()).to.exist
      })
    })

    // SJCL has not been built with sha512
    // TODO: load sjcl with sha512
    context.skip("with curve secp521r1", () => {
      it ("assigns the correct sha", () => {
        const curve = new Curve("c521")
        expect(curve.sha()).to.be.equal(sjcl.hash.sha512)
        expect(curve.sha()).to.exist
      })
    })
  })

  describe("scalarHexPrimitive()", () => {
    it("returns the correct value", () => {
      const name = "k256";
      const curve = new Curve(name)

      expect(curve.scalarHexPrimitive().source).to.equal('([a-f0-9]{64})')
    })
  })

  describe("pointHexPrimitive()", () => {
    it("returns the correct value", () => {
      const name = "k256";
      const curve = new Curve(name)

      expect(curve.pointHexPrimitive().source).to.equal('((?:02|03)([a-f0-9]{64})|00)')
    })
  })

  describe("scalarHexPattern()", () => {
    it("returns the correct value", () => {
      const name = "k256";
      const curve = new Curve(name)

      expect(curve.scalarHexPattern().source).to.equal('^([a-f0-9]{64})$')
    })
  })

  describe("pointHexPattern()", () => {
    it("returns the correct value", () => {
      const name = "k256";
      const curve = new Curve(name)

      expect(curve.pointHexPattern().source).to.equal('^((?:02|03)([a-f0-9]{64})|00)$')
    })
  })

  describe("scalarHexSize()", () => {
    it("returns the correct value", () => {
      const name = "k256";
      const curve = new Curve(name)

      expect(curve.scalarHexSize()).to.equal(64)
    })
  })
})
