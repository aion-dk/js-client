import { contestSelectionToByteArray, byteArrayToContestSelection } from '../../lib/av_client/encoding/byte_encoding'
import { expect } from 'chai'
import { NewContestConfig, ContestSelection } from '../../lib/av_client/types'

const contestConfig: NewContestConfig = {
    content: {
      reference: 'contest ref 1',
      title: { en: 'Contest title' },
      subtitle: { en: '' },
      description: { en: '' },
      markingType: {
        minMarks: 1,
        maxMarks: 3,
        blankSubmission: "disabled",
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
    const contestSelection: ContestSelection = {
      reference: 'contest ref 1',
      optionSelections: [
        { reference: 'ref2' },
        { reference: 'ref3', text: 'hello' },
        { reference: 'ref1' }
      ]
    }

    expect(contestSelectionToByteArray(contestConfig, contestSelection).toString()).to.eq('2,3,104,101,108,108,111,0,0,0,0,0,1,0,0,0,0,0,0,0')
  })
  context('when selections are blank', () => {
    const contestSelection: ContestSelection = {
      reference: 'contest ref 1',
      optionSelections: []
    }
    it('return a null-only byte array', () => {
      expect(contestSelectionToByteArray(contestConfig, contestSelection).toString()).to.eq('0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0')
    })
  })
  context('when selections does not match contest config', () => {
    const contestSelection: ContestSelection = {
      reference: 'contest ref mismatch',
      optionSelections: []
    }
    
    it('throws an error', () => {
      expect(() => {
        contestSelectionToByteArray(contestConfig, contestSelection)
      }).to.throw('contest selection does not match contest')
    })
  })
})

describe('byteArrayToContestSelection', () => {
  const byteArray = Uint8Array.of(2,3,104,101,108,108,111,0,0,0,0,0,1)
  const contestSelection: ContestSelection = {
    reference: 'contest ref 1',
    optionSelections: [
      { reference: 'ref2' },
      { reference: 'ref3', text: 'hello' },
      { reference: 'ref1' }
    ]
  }

  it('returns a ContestSelection when given a valid Uint8Array', () => {
    const result = byteArrayToContestSelection(contestConfig, byteArray)
    expect(result).to.deep.equal(contestSelection)
  })

  context('when byte array contains padding', () => {
    const byteArray = Uint8Array.of(2,3,104,101,108,108,111,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0)

    it('returns a ContestSelection when given a valid Uint8Array', () => {
      const result = byteArrayToContestSelection(contestConfig, byteArray)
      expect(result).to.deep.equal(contestSelection)
    })
  })

  context('when byte array contains an unexpected code', () => {

    it('throws an error', () => {
      const byteArray = Uint8Array.of(42)
      expect(() => {

        byteArrayToContestSelection(contestConfig, byteArray)
      }).to.throw('ArgumentError: Unexpected option code encountered')
    })
  })
})
