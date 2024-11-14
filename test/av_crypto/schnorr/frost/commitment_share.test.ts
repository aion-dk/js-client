import { expect } from "chai";
import {Curve} from "../../../../lib/av_crypto/curve";
import {fixedPoint1, fixedPoint2} from "../../test_helpers";
import {CommitmentShare} from "../../../../lib/av_crypto/schnorr/frost/commitment_share";
import * as sjcl from "sjcl-with-all";
import {pointToHex, scalarToHex} from "../../../../lib/av_crypto/utils";

describe("Commitment share", () => {
  const curve = new Curve('k256')
  const i = new sjcl.bn(2)
  const d = fixedPoint1(curve)
  const e = fixedPoint2(curve)

  describe("constructor", () => {
    const commitmentShare = new CommitmentShare(i, d, e, curve)

    it ("constructs a CommitmentShare", () => {
      expect(commitmentShare.i).to.equal(i)
      expect(commitmentShare.d).to.equal(d)
      expect(commitmentShare.e).to.equal(e)
    })
  })

  describe("toString()", () => {
    const commitmentShare = new CommitmentShare(i, d, e, curve)

    it ("renders hex values concatenated by dashes", () => {
      const i_hex = scalarToHex(commitmentShare.i, curve)
      const d_hex = pointToHex(commitmentShare.d)
      const e_hex = pointToHex(commitmentShare.e)

      expect(commitmentShare.toString()).to.equal(i_hex + "-" + d_hex + "-" + e_hex)
    })
  })
})
