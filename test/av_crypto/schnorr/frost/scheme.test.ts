import { expect } from "chai";
import {describe} from "mocha";
import * as sjcl from "sjcl-with-all";
import {Curve} from "../../../../lib/av_crypto/curve";
import {partialSign} from "../../../../lib/av_crypto/schnorr/frost/scheme";
import {
  fixedKeyPair,
  fixedKeyPair2,
  fixedPoint1,
  fixedPoint2,
  fixedScalar1,
  fixedScalar2,
  hexString
} from "../../test_helpers";
import {SingleUseNonce} from "../../../../lib/av_crypto/schnorr/frost/single_use_nonce";
import {CommitmentShare} from "../../../../lib/av_crypto/schnorr/frost/commitment_share";
import {addScalars, scalarToHex} from "../../../../lib/av_crypto/utils";
import {Polynomial} from "../../../../lib/av_crypto/threshold/polynomial";

describe("Schnorr FROST threshold signature scheme", () => {
  const curve = new Curve('k256')
  const message = "hello"
  const id1 = new sjcl.bn(42)
  const id2 = new sjcl.bn(2)
  const keyPair1 = fixedKeyPair(curve);
  const keyPair2 = fixedKeyPair2(curve);
  const polynomial1 = new Polynomial([keyPair1, keyPair2], curve)
  const polynomial2 = new Polynomial([keyPair2, keyPair1], curve)
  const partialPrivateShare11 = polynomial1.evaluateAt(id1);
  const partialPrivateShare12 = polynomial2.evaluateAt(id1);
  const privateShare = addScalars([partialPrivateShare11, partialPrivateShare12], curve)
  const nonce1 = new SingleUseNonce(fixedScalar1(curve), fixedScalar2(curve))
  const commitments = [
    new CommitmentShare(id1, fixedPoint1(curve), fixedPoint2(curve), curve),
    new CommitmentShare(id2, fixedPoint2(curve), fixedPoint1(curve), curve),
  ]

  describe("partial sign()", () => {
    it("returns a partial signature", () => {
      const signature = partialSign(message, privateShare, id1, nonce1, commitments, curve)

      expect(scalarToHex(signature, curve)).to.equal(hexString(
        "1896251c 9dbcf4c7 f6c29cc4 88c531d7" +
        "f9756907 658645e3 03193d5f d61c491b"
      ));
    })
  })
})
