import {SHA384} from "../../lib/av_crypto/sha384";
import * as sjcl from "sjcl-with-all";
import {expect} from "chai";
import {hexString} from "./test_helpers";

describe("SHA384", () => {
  const sha = SHA384
  describe("hash()", () => {
    context("when given BitArray", () => {
      const data = sjcl.codec.bytes.toBits([1, 2, 3])

      it("returns the correct value", () => {
        const digest = sha.hash(data)

        expect (sjcl.codec.hex.fromBits(digest)).to.eql(hexString(
          "86229dc6 d2ffbeac 73807441 54aa7002" +
          "91c06435 2a0dbdc7 7b9ed3f2 c8e1dac4" +
          "dc325867 d39ddff1 d2629b7a 393d47f6"
        ))
      })

      it("can handle every single byte", () => {
        const data = sjcl.codec.bytes.toBits(Array.from(Array(255).keys()))
        const digest = sha.hash(data)

        expect (digest).to.exist
      })
    })

    context("when given string", () => {
      const data = "hello world"

      it("returns the correct value", () => {
        const digest = sha.hash(data)

        expect (sjcl.codec.hex.fromBits(digest)).to.eql(hexString(
          "fdbd8e75 a67f29f7 01a4e040 385e2e23" +
          "986303ea 10239211 af907fcb b83578b3" +
          "e417cb71 ce646efd 0819dd8c 088de1bd"
        ))
      })
    })
  })
})
