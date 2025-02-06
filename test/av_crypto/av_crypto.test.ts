import { expect } from "chai";
import {AVCrypto, hexDigest} from "../../lib/av_crypto";
import {fixedPoint1Hex, fixedPoint2Hex, fixedScalar1Hex, fixedScalar2Hex} from "./test_helpers";
import {pattern as cryptogramPattern} from "../../lib/av_crypto/el_gamal/cryptogram";
import {pattern as proofPattern} from "../../lib/av_crypto/discrete_logarithm/proof";
import {pattern as signaturePattern} from "../../lib/av_crypto/schnorr/signature";
import * as sjcl from "sjcl-with-all";
import {scalarToHex} from "../../lib/av_crypto/utils";

describe("AVCrypto", () => {
  describe("constructor", () => {
    it("constructs an AV Crypto instance", () => {
      const curveName = "secp256k1";
      const crypto = new AVCrypto(curveName)

      expect(crypto).to.be.an.instanceof(AVCrypto);
    })

    context("with valid curve names", () => {
      const supportedCurveNames = ['secp256k1', 'secp256r1', 'secp384r1', 'secp521r1']

      it("constructs an AV Crypto instance", () => {
        supportedCurveNames.forEach( curveName => {
          expect(new AVCrypto(curveName)).to.be.an.instanceof(AVCrypto);
        })
      })
    })

    context("with invalid curve name", () => {
      it("throws error", () => {
        const curveName = "invalid";

        expect(() => {
          new AVCrypto(curveName)
        }).to.throw("input must be one of the followings: secp256k1, secp256r1, secp384r1, secp521r1")
      })
    })
  })

  describe("generateKeyPair()" , () => {
    const curveName = "secp256k1";
    const crypto = new AVCrypto(curveName)
    const curve = crypto.curve

    it("returns a private public key pair", () => {
      const {privateKey, publicKey} = crypto.generateKeyPair()

      expect(privateKey).match(curve.scalarHexPattern())
      expect(publicKey).match(curve.pointHexPattern())
    })
  })

  describe("encryptVote()", () => {
    const curveName = "secp256k1";
    const crypto = new AVCrypto(curveName)
    const curve = crypto.curve
    const vote = new TextEncoder().encode("vote")
    const encryptionKey = fixedPoint1Hex(curve)

    it("returns 1 cryptogram and 1 randomizer", () => {
      const {cryptograms, randomizers} = crypto.encryptVote(vote, encryptionKey)

      expect(cryptograms.length).to.eql(1)
      expect(randomizers.length).to.eql(1)
      expect(cryptograms[0]).match(cryptogramPattern(curve))
      expect(randomizers[0]).match(curve.scalarHexPattern())
    })

    context("with a vote that fits in multiple cryptograms", () => {
      const vote = new Uint8Array(Array(32).fill(255))

      it("returns multiple cryptograms and randomizers", () => {
        const {cryptograms, randomizers} = crypto.encryptVote(vote, encryptionKey)

        expect(cryptograms.length).to.eql(2)
        expect(randomizers.length).to.eql(2)
      })
    })
  })

  describe("encryptTransparentVote()", () => {
    const curveName = "secp256k1";
    const crypto = new AVCrypto(curveName)
    const curve = crypto.curve
    const vote = new TextEncoder().encode("vote")
    const encryptionKey = fixedPoint1Hex(curve)
    const transparentCryptogramPattern = new RegExp("^(00," + curve.pointHexPrimitive().source +")$")

    it("returns 1 cryptogram and 1 randomizer that is zero", () => {
      const {cryptograms, randomizers} = crypto.encryptTransparentVote(vote, encryptionKey)

      expect(cryptograms.length).to.eql(1)
      expect(randomizers.length).to.eql(1)
      expect(cryptograms[0]).to.match(transparentCryptogramPattern)
      expect(randomizers[0]).to.eql("0000000000000000000000000000000000000000000000000000000000000000")
    })

    context("with a vote that fits in multiple cryptograms", () => {
      const vote = new Uint8Array(Array(32).fill(255))

      it("returns multiple cryptograms and randomizers that are zeros", () => {
        const {cryptograms, randomizers} = crypto.encryptTransparentVote(vote, encryptionKey)

        expect(cryptograms.length).to.eql(2)
        expect(randomizers.length).to.eql(2)
        cryptograms.forEach(cryptogram => {
          expect(cryptogram).to.match(transparentCryptogramPattern)
        })
        randomizers.forEach(randomizer => {
          expect(randomizer).to.eql("0000000000000000000000000000000000000000000000000000000000000000")
        })
      })
    })
  })

  describe("combineCryptograms()", () => {
    const curveName = "secp256k1";
    const crypto = new AVCrypto(curveName)
    const curve = crypto.curve
    const voterCryptogram = [fixedPoint1Hex(curve),fixedPoint2Hex(curve)].join(",")
    const serverCryptogram = [fixedPoint1Hex(curve),fixedPoint2Hex(curve)].join(",")

    it("returns a cryptogram", () => {
      const finalCryptogram = crypto.combineCryptograms(voterCryptogram, serverCryptogram)

      expect(finalCryptogram).match(cryptogramPattern(curve))
    })
  })

  describe("revertEncryption()", () => {
    const curveName = "secp256k1";
    const crypto = new AVCrypto(curveName)
    const curve = crypto.curve
    const vote = new TextEncoder().encode("vote")
    const encryptionKey = fixedPoint1Hex(curve)
    const { cryptograms, randomizers } = crypto.encryptVote(vote, encryptionKey)
    const boardRandomizers = [scalarToHex(new sjcl.bn(0), curve)]

    it("returns the vote back", () => {
      const decrypted = crypto.revertEncryption(cryptograms, boardRandomizers, randomizers, encryptionKey)

      expect(decrypted.slice(0, vote.length)).to.eql(vote)
      decrypted.slice(vote.length).forEach(byte => {
        expect(byte).to.eql(0)
      })
    })

    context("with a vote that fits in multiple cryptograms", () => {
      const vote = new Uint8Array(Array(32).fill(255))
      const { cryptograms, randomizers } = crypto.encryptVote(vote, encryptionKey)
      const boardRandomizers = [scalarToHex(new sjcl.bn(0), curve), scalarToHex(new sjcl.bn(0), curve)]

      it("returns the vote back", () => {
        const decrypted = crypto.revertEncryption(cryptograms, boardRandomizers, randomizers, encryptionKey)

        expect(cryptograms.length).to.eql(2)
        expect(decrypted.slice(0, vote.length)).to.eql(vote)
        decrypted.slice(vote.length).forEach(byte => {
          expect(byte).to.eql(0)
        })
      })
    })
  })

  describe("generateProofOfCorrectEncryption", () => {
    const curveName = "secp256k1";
    const crypto = new AVCrypto(curveName)
    const curve = crypto.curve
    const randomizer = fixedScalar1Hex(curve)

    it("return a discrete logarithm proof", () => {
      const proof = crypto.generateProofOfCorrectEncryption(randomizer)

      expect(proof).to.match(proofPattern(curve))
    })
  })

  describe("commit()", () => {
    const curveName = "secp256k1";
    const crypto = new AVCrypto(curveName)
    const curve = crypto.curve

    const privateEncryptionRandomizers = [
      fixedScalar1Hex(curve),
      fixedScalar2Hex(curve)
    ]

    it("returns commitment and randomizer", () => {
      const {commitment, privateCommitmentRandomizer} = crypto.commit(privateEncryptionRandomizers)

      expect(commitment).match(curve.pointHexPattern())
      expect(privateCommitmentRandomizer).match(curve.scalarHexPattern())
    })

    context("when given context", () => {
      const context = "hello"

      it("returns commitment and randomizer", () => {
        const {commitment, privateCommitmentRandomizer} = crypto.commit(privateEncryptionRandomizers, context)

        expect(commitment).match(curve.pointHexPattern())
        expect(privateCommitmentRandomizer).match(curve.scalarHexPattern())
      })
    })
  })

  describe("isValidCommitment()", () => {
    const curveName = "secp256k1";
    const crypto = new AVCrypto(curveName)
    const curve = crypto.curve

    const privateEncryptionRandomizers = [
      fixedScalar1Hex(curve),
      fixedScalar2Hex(curve)
    ]
    const commitment = "036538ac905422a5691bb7142482e09327c1ef0fba3d1b7a803fa76112daa176ab"
    const privateCommitmentRandomizer = "842eef849fb93b5f6dde0d63786c552c87d0a3d939f529d4fa73b30cae025843"

    it("returns true", () => {
      const valid = crypto.isValidCommitment(
        commitment,
        privateCommitmentRandomizer,
        privateEncryptionRandomizers
      )

      expect(valid).to.be.true
    })

    context("with a different context", () => {
      const context = "hello"

      it("returns false", () => {
        const valid = crypto.isValidCommitment(
          commitment,
          privateCommitmentRandomizer,
          privateEncryptionRandomizers,
          context
        )

        expect(valid).to.be.false
      })
    })
  })

  describe("encryptText()", () => {
    const curveName = "secp256k1";
    const crypto = new AVCrypto(curveName)

    const encryptionKey = fixedPoint1Hex(crypto.curve)

    it("returns a ciphertext", () => {
      const ciphertext = crypto.encryptText("hello world", encryptionKey)

      expect(ciphertext).to.be.a("string");
    })
  })

  describe("decryptText()", () => {
    const curveName = "secp256k1";
    const crypto = new AVCrypto(curveName)

    const decryptionKey = fixedScalar1Hex(crypto.curve)
    const ciphertext = '{' +
      '"ciphertext":"Oz9R53w3osJ8ogQ=",' +
      '"tag":"GNNEi13wIJR71NTeLGUjCw==",' +
      '"iv":"2/kdEBQXcCx5REIz",' +
      '"ephemeralPublicKey":"02bdfd41e1d8e80c2aef757713599ce80435f73b294bcbf15d4039bbe663fb69f1"' +
      '}'

    it("returns the text", () => {
      const text = crypto.decryptText(ciphertext, decryptionKey)
      expect(text).to.eql("hello world");
    })
  })

  describe("generateProofOfElectionCodes()", () => {
    const curveName = "secp256k1";
    const crypto = new AVCrypto(curveName)
    const curve = crypto.curve

    it("returns a private public key pair", () => {
      const electionCodes = ["a", "b", "c"]
      const {privateKey, publicKey, proof} = crypto.generateProofOfElectionCodes(electionCodes)

      expect(privateKey).match(curve.scalarHexPattern())
      expect(publicKey).match(curve.pointHexPattern())
      expect(proof).match(proofPattern(curve))
    })

    it("returns deterministic keypair", () => {
      const electionCodes = ["1"]
      const {privateKey, publicKey, proof} = crypto.generateProofOfElectionCodes(electionCodes)

      expect(privateKey).eql("a259f4b44e30abc0cd53379381bdc86f44723911a5bc03bf4ff21d1b49b53efd")
      expect(publicKey).eql("0290d410a7d25411bdd3d82ace5f707d02c054b60e7dc8883c1f07be4265704dd6")
    })

    context("with 521 curve", () => {
      const curveName = 'secp521r1';
      const crypto = new AVCrypto(curveName)
      const curve = crypto.curve

      it("returns a private public key pair", () => {
        const electionCodes = ["1", "2"]
        const {privateKey, publicKey, proof} = crypto.generateProofOfElectionCodes(electionCodes)

        expect(privateKey).match(curve.scalarHexPattern())
        expect(publicKey).match(curve.pointHexPattern())
        expect(proof).match(proofPattern(curve))
      })

      it("returns deterministic keypair", () => {
        const electionCodes = ["1"]
        const {privateKey, publicKey, proof} = crypto.generateProofOfElectionCodes(electionCodes)

        expect(privateKey).eql("0059f4b44e30abc0cd53379381bdc86f44723911a5bc03bf4ff21d1b49b53efd4bcd1311e502bbc66c29d2302b3ba26700225a76e6bb867063dfe7f34f259add7741")
        expect(publicKey).eql("0201966d91cae0ae153148b68ff1c04a86e38ca4d693ebe5fa39288e1c871e15642b10494cf566d739146e659c8e50a0b7b5d4571f3ad4b5e3077af5181ad6101ffc0b")
      })
    })
  })

  describe("sign()", () => {
    const crypto = new AVCrypto("secp256k1")

    it("returns a string signature", () => {
      const signature = crypto.sign("hello", fixedScalar1Hex(crypto.curve))

      console.log(signature)

      expect(signature).to.match(signaturePattern(crypto.curve))
    })
  })

  describe("isValidSignature()", () => {
    const crypto = new AVCrypto("secp256k1")
    const signature = "4b477c20f9babaab476eece0f240552c6a84cc15939e1e14e31170a7e35d24e1,281f71f08c1474b01c9dc82bdf06b126b76c1eaa604292a69a6d1f836a949648"
    const message = "hello"

    it("returns true", () => {
      const valid = crypto.isValidSignature(signature, message, fixedPoint1Hex(crypto.curve))

      expect(valid).to.be.true
    })

    context("with a different message", () => {
      const message = "different message"
      it("returns false", () => {
        const valid = crypto.isValidSignature(signature, message, fixedPoint1Hex(crypto.curve))

        expect(valid).to.be.false
      })
    })
  })

  describe("hexDigest()", () => {
    it("returns the hash", () => {
      const hash = hexDigest("The quick brown fox jumps over the lazy dog")

      expect(hash).to.eql("d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592")
    })
  })
})
