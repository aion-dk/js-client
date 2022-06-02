import { expect } from "chai";
import { ByteArrayWriter } from "../../lib/av_client/encoding/byte_array_writer";

describe("ByteArrayWriter", () => {

  describe("new ByteArrayWriter()", () => {
    it("generates an internal byte array of given length prefilled with null bytes", () => {
      const writer = new ByteArrayWriter(5)
      expect(writer.getByteArray().toString()).to.equal('0,0,0,0,0')
    })
  })

  describe(".write()", () => {
    it("can write to the internal byte array", () => {
      const writer = new ByteArrayWriter(8)

      writer.write(Uint8Array.of(1,2,3))
      writer.write(Uint8Array.of(4,5,6))

      expect(writer.getByteArray().toString()).to.equal('1,2,3,4,5,6,0,0')
    })

    context("when exceeding the allocated amount of bytes", () => {
      it("throws error with text 'Out of bounds'", () => {
        const writer = new ByteArrayWriter(8)

        writer.write(Uint8Array.of(1,2,3))
        writer.write(Uint8Array.of(4,5,6))

        expect(() => {
          writer.write(Uint8Array.of(4,5,6))
        }).to.throw('Out of bounds')

      })
    })
  })

  describe(".writeInteger()", () => {
    it("can write an one byte integer to the internal byte array", () => {
      const writer = new ByteArrayWriter(1)
      writer.writeInteger(1, 42)
      expect(writer.getByteArray().toString()).to.equal('42')
    })

    it("throws when the integer is too big for the allocated space", () => {
      const writer = new ByteArrayWriter(2)
      expect(() => {
        writer.writeInteger(1, 256)
      }).to.throw('The provided integer requires more bytes')
    })

    it("throws when given a negative integer", () => {
      const writer = new ByteArrayWriter(2)
      expect(() => {
        writer.writeInteger(1, -1)
      }).to.throw('Only non-negative integers supported')
    })

    it("throws when given a float", () => {
      const writer = new ByteArrayWriter(2)
      expect(() => {
        writer.writeInteger(1, 1.543)
      }).to.throw('Only non-negative integers supported')
    })

    context("with two bytes allocated", () => {
      it("can write a one byte integer to the internal byte array", () => {
        const writer = new ByteArrayWriter(2)
        writer.writeInteger(2, 42)
        expect(writer.getByteArray().toString()).to.equal('0,42')
      })
      it("can write a two byte integer to the internal byte array", () => {
        const writer = new ByteArrayWriter(2)
        writer.writeInteger(2, 342)
        expect(writer.getByteArray().toString()).to.equal('1,86')
      })
      it("throws when the integer is too big for the allocated space", () => {
        const writer = new ByteArrayWriter(2)
        expect(() => {
          writer.writeInteger(2, 65536)
        }).to.throw('The provided integer requires more bytes')
      })
    })
  })

  describe(".writeString()", () => {
    it("can write a string to the internal byte array", () => {
      const writer = new ByteArrayWriter(10)
      writer.writeString(10, 'halløj!')
      expect(writer.getByteArray().toString()).to.equal('104,97,108,108,195,184,106,33,0,0')
    })
    it("can write emojis", () => {
      const writer = new ByteArrayWriter(10)
      writer.writeString(10, '💩')
      expect(writer.getByteArray().toString()).to.equal('240,159,146,169,0,0,0,0,0,0')
    })
    it("throws when provided string byte size is bigger than allocated space", () => {
      const writer = new ByteArrayWriter(10)
      expect(() => {
        writer.writeString(5, '💩💩')
      }).to.throw('offset is out of bounds')
    })
    context("with more bytes allocated than needed", () => {
      it("appends string padded with null bytes and moves internal pointer", () => {
        const writer = new ByteArrayWriter(10)
        writer.writeString(5, 'one')
        writer.writeString(5, 'two')
        expect(writer.getByteArray().toString()).to.equal('111,110,101,0,0,116,119,111,0,0')
      })
    })
  })
})
