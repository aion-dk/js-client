import { expect } from "chai";
import {Curve} from "../../lib/av_crypto/curve";
import * as sjcl from "sjcl-with-all";
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

    context("with curve secp256r1", () => {
      const name = "c256";
      const curve = new Curve(name)

      it ("returns the correct value", () => {
        expect(scalarToHex(curve.order(), curve)).to.equal(hexString(
          "ffffffff 00000000 ffffffff ffffffff" +
          "bce6faad a7179e84 f3b9cac 2fc632551"
        ))
      })
    })

    context("with curve secp384r1", () => {
      const name = "c384";
      const curve = new Curve(name)

      it ("returns the correct value", () => {
        expect(scalarToHex(curve.order(), curve)).to.equal(hexString(
          "ffffffff ffffffff ffffffff ffffffff" +
          "ffffffff ffffffff c7634d81 f4372ddf" +
          "581a0db2 48b0a77a ecec196a ccc52973"
        ))
      })
    })

    context("with curve secp521r1", () => {
      const name = "c521";
      const curve = new Curve(name)

      it ("returns the correct value", () => {
        expect(scalarToHex(curve.order(), curve)).to.equal(hexString(
          "01ff" +
          "ffffffff ffffffff ffffffff ffffffff" +
          "ffffffff ffffffff ffffffff fffffffa" +
          "51868783 bf2f966b 7fcc0148 f709a5d0" +
          "3bb5c9b8 899c47ae bb6fb71e 91386409"
        ))
      })
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

    context("with curve secp256r1", () => {
      const name = "c256";
      const curve = new Curve(name)

      it ("returns the correct value", () => {
        expect(pointToHex(curve.G())).to.equal(hexString(
          "03" +
          "6b17d1f2 e12c4247 f8bce6e5 63a440f2" +
          "77037d81 2deb33a0 f4a13945 d898c296"
        ))
      })
    })

    context("with curve secp384r1", () => {
      const name = "c384";
      const curve = new Curve(name)

      it ("returns the correct value", () => {
        expect(pointToHex(curve.G())).to.equal(hexString(
          "03" +
          "aa87ca22 be8b0537 8eb1c71e f320ad74" +
          "6e1d3b62 8ba79b98 59f741e0 82542a38" +
          "5502f25d bf55296c 3a545e38 72760ab7"
        ))
      })
    })

    context("with curve secp521r1", () => {
      const name = "c521";
      const curve = new Curve(name)

      it ("returns the correct value", () => {
        expect(pointToHex(curve.G())).to.equal(hexString(
          "0200c6" +
          "858e06b7 0404e9cd 9e3ecb66 2395b442" +
          "9c648139 053fb521 f828af60 6b4d3dba" +
          "a14b5e77 efe75928 fe1dc127 a2ffa8de" +
          "3348b3c1 856a429b f97e7e31 c2e5bd66"
        ))
      })
    })
  })

  describe("sha()", () => {
    context("with curve secp256k1", () => {
      it("returns the correct sha", () => {
        const curve = new Curve("k256")
        expect(curve.sha()).to.exist
        expect(curve.sha()).to.equal(sjcl.hash.sha256)
      })
    })

    context("with curve secp256r1", () => {
      it ("assigns the correct sha", () => {
        const curve = new Curve("c256")
        expect(curve.sha()).to.exist
        expect(curve.sha()).to.be.equal(sjcl.hash.sha256)
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

    context("with curve secp521r1", () => {
      it ("assigns the correct sha", () => {
        const curve = new Curve("c521")
        expect(curve.sha()).to.exist
        expect(curve.sha()).to.be.equal(sjcl.hash.sha512)
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
