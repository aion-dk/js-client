import { expect } from 'chai';
import {bytesToPoints, pointsToBytes} from '../lib/av_client/crypto/vote_encoder';
import * as sjcl from '../lib/av_client/sjcl';
import * as crypto from "../lib/av_client/aion_crypto";

describe('encode bytes into ec points', () => {
  it('converts bytes to points', () => {
    const bytes = Uint8Array.from([1, 2, 3])
    const points = bytesToPoints(bytes)

    expect(points.length).to.equal(1)
  })

  it('converts a black vote into none infinity points', () => {
    const bytes = Uint8Array.from([0, 0, 0])
    const points = bytesToPoints(bytes)

    expect(points.every((point) => !point.isIdentity)).to.be.true
  })


  it('converts points to bytes', () => {
    const point1Hex = '020101020300000000000000000000000000000000000000000000000000000000'
    const point2Hex = '020500000000000000000000000000000000000000000000000000000000000000'
    const point1 = crypto.pointFromBits(sjcl.codec.hex.toBits(point1Hex))
    const point2 = crypto.pointFromBits(sjcl.codec.hex.toBits(point2Hex))
    const points = [point1, point2]
    const byteCount = 4
    const bytes = pointsToBytes(points, byteCount)

    expect(bytes.length).to.equal(byteCount)
  })

  it('fails when trying to read too many bytes from the available points', () => {
    const point1Hex = '020101020300000000000000000000000000000000000000000000000000000000'
    const point1 = crypto.pointFromBits(sjcl.codec.hex.toBits(point1Hex))
    const points = [point1]
    const byteCount = 100

    expect(() => pointsToBytes(points, byteCount)).to.throw(Error, "Too many bytes to be decoded from points")
  })

  it('fails when decoding points and padding bytes are non 0x00', () => {
    const point1Hex = '020101020300000000000000000000000000000000000000000000000000000000'
    const point1 = crypto.pointFromBits(sjcl.codec.hex.toBits(point1Hex))
    const points = [point1]
    const byteCount = 1

    expect(() => pointsToBytes(points, byteCount)).to.throw(Error, "Invalid encoding of points")
  })

  it('converts bytes to points and back', () => {
    const bytes = Uint8Array.from([1, 2, 3, 0, 255])
    const points = bytesToPoints(bytes)
    const bytesBack = pointsToBytes(points, bytes.length)

    expect(bytes.length === bytesBack.length &&
        bytes.every((byte, index) => byte === bytesBack[index]))
        .to.be.true
  })
})
