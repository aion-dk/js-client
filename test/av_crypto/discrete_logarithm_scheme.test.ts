import { expect } from "chai";
import {fixedKeyPair, fixedPoint1, fixedPoint2, fixedScalar1, fixedScalar2, hexString} from "./test_helpers";
import {Curve} from "../../lib/av_crypto/curve";
import {describe} from "mocha";
import {isValid, prove} from "../../lib/av_crypto/discrete_logarithm/scheme";
import {Proof, fromString} from "../../lib/av_crypto/discrete_logarithm/proof";

describe("Discrete logarithm scheme", () => {
  const curve = new Curve('k256')
  const knowledge = fixedScalar1(curve)
  const generators = [fixedPoint2(curve)]
  const contextString = "a"

  describe("prove()", () => {
    it("returns a proof", () => {
      const proof = prove(knowledge, contextString, curve, generators)

      expect(proof).to.be.instanceof(Proof);
    })

    context("without generators", () => {
      it("returns a proof", () => {
        const proof = prove(knowledge,contextString, curve)
        expect(proof).to.be.instanceof(Proof);
      })
    })

    context("with fixed randomness", () => {
      const randomness = fixedKeyPair(curve)
      const proof = prove(knowledge, contextString, curve, generators, randomness)

      it("returns a deterministic proof", () => {
        expect(proof.toString()).to.equal(hexString(
          "03" +
          "0973ebf8 4bd41bf6 01e01003 5b583203" +
          "efe01407 458c54d7 15587839 80c9c482" +
          "," +
          "3cfd1170 dabc2b83 cff908ef 52136be7" +
          "144f0b71 8bcf3fdc f4043e3f a772b2e8"
        ));
      })

      context("when given points", () => {
        const points = [fixedPoint2(curve).mult(fixedScalar1(curve))]

        it("generates the same proof as if points where not given", () => {
          const otherProof = prove(knowledge, contextString, curve, generators, randomness, points)

          expect(otherProof.k).to.eql(proof.k);
          expect(otherProof.r).to.eql(proof.r);
        })

        context("when points are incorrect", () => {
          // FIXME: replace this with a random point
          const points = [curve.G()]
          const proof = prove(knowledge, contextString, curve, generators, randomness, points)

          it ("generates an invalid proof", () => {
            const valid = isValid(
              proof,
              contextString,
              generators,
              points,
              fixedPoint1(curve),
              curve);

            expect(valid).to.be.false
          })
        })
      })

      context("with different context", () => {
        const contextString = "b"

        it("returns a different deterministic proof", () => {
          const proof = prove(knowledge, contextString, curve, generators, randomness)
          expect(proof.toString()).to.equal(hexString(
            "03" +
            "0973ebf8 4bd41bf6 01e01003 5b583203" +
            "efe01407 458c54d7 15587839 80c9c482" +
            "," +
            "cb212fe2 aacfffab d55b5383 9f738185" +
            "ac3a0ee0 a020faab 2d29dc67 11f1e4ae"
          ));
        })
      })

      context("with different knowledge", () => {
        const knowledge = fixedScalar2(curve)

        it("returns a different deterministic proof", () => {
          const proof = prove(knowledge, contextString, curve, generators, randomness)
          expect(proof.toString()).to.equal(hexString(
            "03" +
            "b89faa53 71d96b7a e61faecc 1fcdb4c8" +
            "cd4f04f6 d5ca88f2 b36d6008 cae1c81b" +
            "," +
            "8acd9e64 0b640539 c3383e27 dae26174" +
            "5ec971d6 011aa074 c2c2c5a9 475fd4d4"
          ));
        })
      })
    })

    context("with curve secp521r1", () => {
      const curve = new Curve('c521')
      const knowledge = fixedScalar1(curve)
      const generators = [fixedPoint2(curve)]
      const randomness = fixedKeyPair(curve)
      const proof = prove(knowledge, contextString, curve, generators, randomness)

      it("returns a deterministic proof", () => {
        expect(proof.toString()).to.equal(hexString(
          "03005d" +
          "be7d8393 3c729475 523914e1 e5c4a248" +
          "25af7ee8 45eae70e e6172a84 30f47ceb" +
          "388d86e5 e4db617b e21b21ce b59fee8b" +
          "e0b61dec 876f3b05 6d4701c4 544a0b29" +
          "," +
          "0139" +
          "3998f1ba 10d7fe67 89cf5028 f9e7d8bb" +
          "5267f77f 5042c7e6 cf3a3e3e bf9a0b22" +
          "61269376 4a6e56b8 dff5705c ac679c6e" +
          "e3fe5db1 40e9c44a c2c82871 e8f5d1e2"
        ));
      })
    })
  })

  describe("isValid()", () => {
    const publicKey = fixedPoint1(curve)
    const points = [fixedPoint2(curve).mult(fixedScalar1(curve))]
    const proof = fromString(hexString(
      "03" +
      "0973ebf8 4bd41bf6 01e01003 5b583203" +
      "efe01407 458c54d7 15587839 80c9c482" +
      "," +
      "3cfd1170 dabc2b83 cff908ef 52136be7" +
      "144f0b71 8bcf3fdc f4043e3f a772b2e8"
    ), curve)

    it("validates", () => {
      expect(isValid(
        proof,
        contextString,
        generators,
        points,
        publicKey,
        curve
      )).to.be.true
    })

    context("with generators that weren't part of the proof", () => {
      const generators = [fixedPoint1(curve)]

      it("doesn't validate", () => {
        expect(isValid(
          proof,
          contextString,
          generators,
          points,
          publicKey,
          curve
        )).to.be.false
      })
    })

    context("with points that weren't part of the proof", () => {
      // FIXME: replace with random point
      const points = [curve.G()]

      it("doesn't validate", () => {
        expect(isValid(
          proof,
          contextString,
          generators,
          points,
          publicKey,
          curve
        )).to.be.false
      })
    })

    context("with public key that was not part of the proof", () => {
      // FIXME: replace with random point
      const publicKey = curve.G()

      it("doesn't validate", () => {
        expect(isValid(
          proof,
          contextString,
          generators,
          points,
          publicKey,
          curve
        )).to.be.false
      })
    })

    context("with a different context", () => {
      const contextString = "b"

      it("doesn't validate", () => {
        expect(isValid(
          proof,
          contextString,
          generators,
          points,
          publicKey,
          curve
        )).to.be.false
      })
    })

    context("with different size generators and points", () => {
      const generators = [fixedPoint2(curve), fixedPoint1(curve)]

      it("throws error", () => {
        expect(() => {
          isValid(
            proof,
            contextString,
            generators,
            points,
            publicKey,
            curve
          )
        }).to.throw("generators and points must have the same size")
      })
    })

    context("with curve secp521r1", () => {
      const curve = new Curve('c521')
      const publicKey = fixedPoint1(curve)
      const generators = [fixedPoint2(curve)]
      const points = [fixedPoint2(curve).mult(fixedScalar1(curve))]
      const proof = fromString(hexString(
        "03005d" +
        "be7d8393 3c729475 523914e1 e5c4a248" +
        "25af7ee8 45eae70e e6172a84 30f47ceb" +
        "388d86e5 e4db617b e21b21ce b59fee8b" +
        "e0b61dec 876f3b05 6d4701c4 544a0b29" +
        "," +
        "0139" +
        "3998f1ba 10d7fe67 89cf5028 f9e7d8bb" +
        "5267f77f 5042c7e6 cf3a3e3e bf9a0b22" +
        "61269376 4a6e56b8 dff5705c ac679c6e" +
        "e3fe5db1 40e9c44a c2c82871 e8f5d1e2"
      ), curve)

      it("validates", () => {
        expect(isValid(
          proof,
          contextString,
          generators,
          points,
          publicKey,
          curve
        )).to.be.true
      })
    })
  })
})
