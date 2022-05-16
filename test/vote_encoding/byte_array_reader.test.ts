import { expect } from "chai";
import { ByteArrayReader } from "../../lib/av_client/vote_encoding/byte_array_reader";

describe("ByteArrayReader", () => {
  describe("read()", () => {
    it("returns an array of given length and moves pointer", () => {
      const reader = new ByteArrayReader(Uint8Array.of(1,2,3,4))
      expect(reader.read(2).toString()).to.equal('1,2')
      expect(reader.read(2).toString()).to.equal('3,4')
    })
    it("throws when tying to read more bytes than available", () => {
      const reader = new ByteArrayReader(Uint8Array.of(1,2,3,4))
      expect(() => {
        reader.read(5)
      }).to.throw('Out of bounds')
    })
  })
  describe("readInteger()", () => {
    it("reads and returns a one-byte integer", () => {
      const reader = new ByteArrayReader(Uint8Array.of(42))
      expect(reader.readInteger(1)).to.equal(42)
    })
    it("reads, converts and returns a two byte integer", () => {
      const reader = new ByteArrayReader(Uint8Array.of(1,0))
      expect(reader.readInteger(2)).to.equal(256)
    })
  })
  describe("readString()", () => {
    it("reads, converts and returns a utf8 string", () => {
      const reader = new ByteArrayReader(Uint8Array.of(240,159,146,169))
      expect(reader.readString(4)).to.equal('💩')
    })
    context('with invalid utf8 bytes', () => {
      it('returns the unicode replacement character', () => {
        // More on replacement character:
        // https://www.fileformat.info/info/unicode/char/fffd/index.htm

        const reader = new ByteArrayReader(Uint8Array.of(240,159,146,169))
        expect(reader.readString(3)).to.equal('\ufffd')
      })
    })
  })
})