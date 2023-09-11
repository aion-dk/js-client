import { selectionPileToByteArray, byteArrayToSelectionPile } from '../../lib/av_client/encoding/byte_encoding'
import { expect } from 'chai'
import {ContestConfig, SelectionPile} from '../../lib/av_client/types'

const contestConfig: ContestConfig = {
    address: '',
    author: '',
    parentAddress: '',
    previousAddress: '',
    registeredAt: '',
    signature: '',
    type: 'ContestConfigItem',
    content: {
      reference: 'contest ref 1',
      title: { en: 'Contest title' },
      subtitle: { en: '' },
      description: { en: '' },
      markingType: {
        minMarks: 1,
        maxMarks: 3,
        blankSubmission: "disabled",
        votesAllowedPerOption: 1,
        encoding: {
          codeSize: 1,
          maxSize: 20,
          cryptogramCount: 1
        }
      },
      resultType: {
        name: 'does not matter for this test'
      },
      options: [
        {
          reference: 'ref1',
          code: 1,
          title: { en: 'Option 1' },
          subtitle: { en: '' },
          description: { en: '' }
        },
        {
          reference: 'ref2',
          code: 2,
          title: { en: 'Option 2' },
          subtitle: { en: '' },
          description: { en: '' }
        },
        {
          reference: 'ref3',
          code: 3,
          title: { en: 'Option 3 write in' },
          subtitle: { en: '' },
          description: { en: '' },
          writeIn: {
            maxSize: 10,
            encoding: 'utf8'
          }
        }
      ]
    }
  }


describe('contestSelectionToByteArray', () => {
  it('returns a Uint8Array when given a ContestSelection', () => {
    const selectionPile: SelectionPile = {
      multiplier: 1,
      optionSelections: [
        { reference: 'ref2' },
        { reference: 'ref3', text: 'hello' },
        { reference: 'ref1' }
      ]
    }

    expect(selectionPileToByteArray(contestConfig, selectionPile).toString()).to.eq('2,3,104,101,108,108,111,0,0,0,0,0,1,0,0,0,0,0,0,0')
  })
  context('when selections are blank', () => {
    const selectionPile: SelectionPile = {
      multiplier: 1,
      optionSelections: []
    }
    it('return a null-only byte array', () => {
      expect(selectionPileToByteArray(contestConfig, selectionPile).toString()).to.eq('0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0')
    })
  })
})

describe('byteArrayToContestSelection', () => {
  const byteArray = Uint8Array.of(2,3,104,101,108,108,111,0,0,0,0,0,1)
  const selectionPile: SelectionPile = {
    multiplier: 1,
    optionSelections: [
      { reference: 'ref2' },
      { reference: 'ref3', text: 'hello' },
      { reference: 'ref1' }
    ]
  }

  it('returns a ContestSelection when given a valid Uint8Array', () => {
    const result = byteArrayToSelectionPile(contestConfig, byteArray, selectionPile.multiplier)
    expect(result).to.deep.equal(selectionPile)
  })

  context('when byte array contains padding', () => {
    const byteArray = Uint8Array.of(2,3,104,101,108,108,111,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0)

    it('returns a ContestSelection when given a valid Uint8Array', () => {
      const result = byteArrayToSelectionPile(contestConfig, byteArray, selectionPile.multiplier)
      expect(result).to.deep.equal(selectionPile)
    })
  })

  context('when byte array contains an unexpected code', () => {

    it('throws an error', () => {
      const byteArray = Uint8Array.of(42)
      expect(() => {

        byteArrayToSelectionPile(contestConfig, byteArray, selectionPile.multiplier)
      }).to.throw('ArgumentError: Unexpected option code encountered')
    })
  })
})
