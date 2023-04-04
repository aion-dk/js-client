import { expect } from 'chai';
import { encryptContestSelections } from '../lib/av_client/encrypt_contest_selections'
import { ContestConfig, ContestConfigMap } from '../lib/av_client/types';

const encryptionKey = '021edaa87d7626dbd2faa99c4dc080f443c150ab70b24da411b13aa56249b5242e'

const contestOne: ContestConfig = {
  address: '',
  author: '',
  parentAddress: '',
  previousAddress: '',
  registeredAt: '',
  signature: '',
  type: 'ContestConfigItem',
  content: {
    reference: 'contest-1',
    markingType: {
      minMarks: 1,
      maxMarks: 1,
      blankSubmission: "disabled",
      encoding: {
        codeSize: 1,
        maxSize: 1,
        cryptogramCount: 1
      }
    },
    resultType: {
      name: 'does not matter right now'
    },
    title: { en: 'Contest 1' },
    subtitle: { en: 'Contest 1' },
    description: { en: 'Contest 1' },
    options: [
      {
        reference: 'option-1',
        code: 1,
        title: { en: 'Option 1' },
        subtitle: { en: 'Option 1' },
        description: { en: 'Option 1' },
      }
    ]
  }
}

const contestConfigs: ContestConfigMap = {
  [contestOne.content.reference]: contestOne
}

const contestSelections =  [
  {
    reference: 'contest-1',
    piles: [{
      multiplier: 1,
      optionSelections: [
        { reference: 'option-1' }
      ]
    }]

  }
]

describe('encryptContestSelections', () => {

  context('when given a valid contest selection', () => {
    it('returns an array of contest envelopes', () => {
      const contestEnvelopes = encryptContestSelections(contestConfigs, contestSelections, encryptionKey)

      expect(contestEnvelopes.length).to.eql(1)

      const contestEnvelope = contestEnvelopes[0]
      expect(contestEnvelope.reference).to.eql('contest-1')
      expect(contestEnvelope).to.have.all.keys('reference', 'piles')
      expect(contestEnvelope.piles[0].cryptograms.length).to.eql(1)
      expect(contestEnvelope.piles[0].randomizers.length).to.eql(1)
    })
  })

  context('when given a contest selection for a contest that uses 2 cryptograms', () => {
    const bigContest: ContestConfig = {
      address: '',
      author: '',
      parentAddress: '',
      previousAddress: '',
      registeredAt: '',
      signature: '',
      type: 'ContestConfigItem',
      content: {
        reference: 'big-contest',
        markingType: {
          minMarks: 1,
          maxMarks: 1,
          blankSubmission: "disabled",
          encoding: {
            codeSize: 1,
            maxSize: 41,
            cryptogramCount: 2
          }
        },
        resultType: {
          name: 'does not matter right now'
        },
        title: { en: 'Contest 1' },
        subtitle: { en: 'Contest 1' },
        description: { en: 'Contest 1' },
        options: [
          {
            reference: 'option-1',
            code: 1,
            title: { en: 'Option 1' },
            subtitle: { en: 'Option 1' },
            description: { en: 'Option 1' },
            writeIn: {
              maxSize: 40,
              encoding: 'utf8'
            }
          }
        ]
      }
    }
    const contestConfigs: ContestConfigMap = {
      [bigContest.content.reference]: bigContest
    }

    const contestSelections =  [
      {
        reference: 'big-contest',
        piles: [{
          multiplier: 1,
          optionSelections: [
            { reference: 'option-1', text: 'this is a write in text' }
          ]
        }]

      }
    ]

    it('returns an array of one contest envelope that contains 2 cryptograms and 2 randomizers', () => {
      const contestEnvelopes = encryptContestSelections(contestConfigs, contestSelections, encryptionKey)
      expect(contestEnvelopes.length).to.eql(1)

      const contestEnvelope = contestEnvelopes[0]
      expect(contestEnvelope.reference).to.eql('big-contest')
      expect(contestEnvelope.piles[0].cryptograms.length).to.eql(2)
      expect(contestEnvelope.piles[0].randomizers.length).to.eql(2)
    })
  })
})
