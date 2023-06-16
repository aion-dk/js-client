import { expect } from "chai";
import {encode, decode} from "../../lib/av_crypto/jwt";
import * as sjcl from "sjcl-with-all";
import {fixedPoint1, fixedScalar1, hexString} from "./test_helpers";
import {Curve} from "../../lib/av_crypto/curve";
import {number} from "@noble/hashes/_assert";

describe("Json Web Token", () => {
  const curve = new Curve("c256")
  const privateKey = fixedScalar1(curve)
  const publicKey = fixedPoint1(curve)

  describe("encode()", () => {
    const payload = { key: 'hello' }

    const token = encode(payload)
    const decoded = decode(token)

    it ("encodes the right token", () => {
      expect(token).to.exist
      expect(decoded).to.have.all.keys('key', 'iat', 'exp')
      expect(decoded['key']).to.equal('hello')
      expect(decoded['iat']).to.be.instanceof(number)
      expect(decoded['exp']).to.be.instanceof(number)
    })
  })
})
