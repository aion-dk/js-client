import { expect } from "chai";
import {generateCommitment, validateCommitment} from "../../lib/av_client/new_crypto/commitments";
import {AVCrypto} from "../../lib/av_crypto";

describe("Pedersen Commitment", () => {
  const messages = {
    "1": [[
      "d70d319fd1c7867af1ca477878d381e4d70d319fd1c7867af1ca477878d381e4",
      "ef5b373b279ed26cf774d7e3376ac549ef5b373b279ed26cf774d7e3376ac549"
    ]],
    "2": [[
      "3c2e2bdcc29734c7e06d53b37cc2724c3c2e2bdcc29734c7e06d53b37cc2724c",
      "000000dcc29734c7e06d53b37cc2724c000000dcc29734c7e06d53b37cc2724c"
    ]]
  };
  const crypto = new AVCrypto("secp256k1")

  describe("generateCommitment()", () => {
    it("generate commitment from single message", () => {
      const result = generateCommitment(crypto, messages);

      expect(result.commitment).to.exist
      expect(result.randomizer).to.exist
    })
  })

  describe("validateCommitment()", () => {
    const commitment = "0270d4e11f07fa46f78f729ff41da8ed21a26170431862ca93fd11372e7c7a518e"
    const randomizer = "d253c38e28661dcaf7116a43f0dce6c33c845f5e905c528ff86cad34f1212308"
    const commitmentOpening = {
      randomizers: messages,
      commitmentRandomness: randomizer
    }

    it("validates", () => {
      expect(() => {
        validateCommitment(crypto, commitmentOpening, commitment)
      }).to.not.throw()
    })

    context("when wrong commitment", () => {
      const commitment = "0328028ddb8f420c061239339c8fbe7fcbaf9fa02fbd2da797d390a3d524509015"

      it("throws error", () => {
        expect(() => {
          validateCommitment(crypto, commitmentOpening, commitment)
        }).to.throw('Pedersen commitment not valid')
      })

      context('when given custom error message', () => {
        const message = "hello"

        it("throws a custom error", () => {
          expect(() => {
            validateCommitment(crypto, commitmentOpening, commitment, message)
          }).to.throw(message)
        })
      })
    })
  })
});
