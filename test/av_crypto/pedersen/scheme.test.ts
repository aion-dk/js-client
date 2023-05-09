import { expect } from "chai";
import {fixedKeyPair, fixedScalar1, fixedScalar2, hexString} from "../test_helpers";
import {Curve} from "../../../lib/av_crypto/curve";
import {describe} from "mocha";
import {commit, isValid} from "../../../lib/av_crypto/pedersen/scheme";
import {Commitment} from "../../../lib/av_crypto/pedersen/commitment";
import {hexToPoint, pointToHex} from "../../../lib/av_crypto/utils";

describe("Pedersen commitment scheme", () => {
  const curve = new Curve('k256')
  const messages = fixedScalar1(curve)
  const contextString = "hello"

  describe("commit()", () => {
    it("returns a commitment", () => {
      const commitment = commit(messages, contextString, curve)

      expect(commitment).to.be.instanceof(Commitment);
    })

    context("with multiple messages", () => {
      const messages = [fixedScalar1(curve), fixedScalar2(curve)]
      it("returns a commitment", () => {
        const commitment = commit(messages, contextString, curve)

        expect(commitment).to.be.instanceof(Commitment);
      })
    })

    context("with fixed randomness", () => {
      const randomness = fixedKeyPair(curve)

      it("returns a deterministic commitment", () => {
        const commitment = commit(messages, contextString, curve, randomness)

        expect(pointToHex(commitment.c)).to.equal(hexString(
          "02" +
          "5b96b0c4 fba96783 d04c749c 44127c19" +
          "d426e9f1 b7509ef5 d16f1257 cb89ea3a"
        ));
      })

      context("with multiple messages", () => {
        const messages = [fixedScalar1(curve), fixedScalar2(curve)]

        it("returns a different deterministic commitment", () => {
          const commitment = commit(messages, contextString, curve, randomness)

          expect(pointToHex(commitment.c)).to.equal(hexString(
            "02" +
            "b5ac426e 0ca333ff a8f90cc1 18446126" +
            "b96d6bd5 7b43d8e6 6cfd091f cef8c4e9"
          ));
        })
      })

      context("with a different context", () => {
        const contextString = "2"

        it("returns a different deterministic commitment", () => {
          const commitment = commit(messages, contextString, curve, randomness)

          expect(pointToHex(commitment.c)).to.equal(hexString(
            "02" +
            "1a9c3113 b9d91f88 9cfe3dd1 9b79fca1" +
            "119f59d3 ce5557d8 d2ee624b 7862bfdb"
          ));
        })
      })

      context("with curve secp521r1", () => {
        const curve = new Curve('c521')
        const messages = fixedScalar1(curve)
        const randomness = fixedKeyPair(curve)

        it("returns a deterministic commitment", () => {
          const commitment = commit(messages, contextString, curve, randomness)

          expect(pointToHex(commitment.c)).to.equal(hexString(
            "020107" +
            "5f2983fb b214b6ef af567695 19a0e07b" +
            "655a2851 df8bd00c 35262083 45f3cc1a" +
            "84105dda c0f5e85a 03d8d024 0847a3fb" +
            "6303ee14 ceae6767 0832a911 92909377"
          ));
        })
      })
    })
  })

  describe("isValid()", () => {
    const c = hexToPoint(hexString(
      "02" +
      "5b96b0c4 fba96783 d04c749c 44127c19" +
      "d426e9f1 b7509ef5 d16f1257 cb89ea3a"
    ), curve)
    const commitment = new Commitment(c, fixedKeyPair(curve).sec.S)

    it("validates", () => {
      expect(isValid(commitment, messages, contextString, curve)).to.be.true
    })

    context("with messages that weren't committed to", () => {
      const messages = fixedScalar2(curve)

      it("doesn't validate", () => {
        expect(isValid(commitment, messages, contextString, curve)).to.be.false
      })
    })

    context("with context that wasn't committed to", () => {
      const contextString = "unicorns"

      it("doesn't validate", () => {
        expect(isValid(commitment, messages, contextString, curve)).to.be.false
      })
    })

    context("with a different commitment point", () => {
      const c = curve.G()
      const commitment = new Commitment(c, fixedKeyPair(curve).sec.S)

      it("doesn't validate", () => {
        expect(isValid(commitment, messages, contextString, curve)).to.be.false
      })
    })

    context("with a different commitment randomness", () => {
      const commitment = new Commitment(c, fixedScalar1(curve))

      it("doesn't validate", () => {
        expect(isValid(commitment, messages, contextString, curve)).to.be.false
      })
    })

    context("with a non-openable commitment", () => {
      const commitment = new Commitment(c)

      it("throws error", () => {
        expect(() => {
          isValid(commitment, messages, contextString, curve)
        }).to.throw("commitment must be openable")
      })
    })

    context("with curve secp521r1", () => {
      const curve = new Curve('c521')
      const messages = fixedScalar1(curve)
      const c = hexToPoint(hexString(
        "020107" +
        "5f2983fb b214b6ef af567695 19a0e07b" +
        "655a2851 df8bd00c 35262083 45f3cc1a" +
        "84105dda c0f5e85a 03d8d024 0847a3fb" +
        "6303ee14 ceae6767 0832a911 92909377"
      ), curve)
      const commitment = new Commitment(c, fixedKeyPair(curve).sec.S)

      it("validates", () => {
        expect(isValid(commitment, messages, contextString, curve)).to.be.true
      })
    })
  })
})
