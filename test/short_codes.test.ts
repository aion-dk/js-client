import { expect } from 'chai';
import { hexToShortCode, shortCodeToHex } from '../lib/av_client/short_codes';


describe('hexToShortCode', () => {
  it('can convert a 10 char hex to a 7 char base58 code', async () => {
    const hex = 'fffFFffffF'
    const result = hexToShortCode(hex)
    expect(result).to.equal("VtB5VXc")
  })

  it('can convert a hex of zeros', async () => {
    const hex = '0000000000'
    const result = hexToShortCode(hex)
    expect(result).to.equal("1111111")
  })

  it('fails when a hex contains more than 40 bits', () => {
    const hex = 'f0000000000'
    expect(() => hexToShortCode(hex)).to.throw(Error, 'Invalid input. Only up to 40 bits are supported.')
  })

  it('fails when passing a non-hex character', () => {
    const hex = 'z'
    expect(() => hexToShortCode(hex)).to.throw(Error, 'Non-hex character')
  })
})

describe('shortCodeToHex', () => {
  it('can convert a 7 char base58 code to a 10 char hex code', async () => {
    const shortCode = "VtB5VXc"
    const result = shortCodeToHex(shortCode)
    expect(result).to.equal("ffffffffff")
  })

  it('can convert a base58 of 1s', async () => {
    const shortCode = "1111111"
    const result = shortCodeToHex(shortCode)
    expect(result).to.equal("0000000000")
  })

  it('fails when a base58 code contains more than 40 bits', () => {
    const shortCode = "VtB5VXd"
    expect(() => shortCodeToHex(shortCode)).to.throw(Error, 'Invalid input. Only up to 40 bits are supported.')
  })

  it('fails when passing a non-base58 character', () => {
    const shortCode = "0"
    expect(() => shortCodeToHex(shortCode)).to.throw(Error, 'Non-base58 character')
  })
})
