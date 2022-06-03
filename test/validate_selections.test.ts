import { validateBallotSelection, validateContestSelection } from '../lib/av_client/validate_selections'
import { expect } from 'chai'
import { ContestConfig, ContestSelection, BallotSelection, BallotConfig, ContestConfigMap } from '../lib/av_client/types'
import { CorruptSelectionError } from '../lib/av_client/errors'

const contestOne: ContestConfig = {
  reference: 'contest-1',
  markingType: {
    minMarks: 1,
    maxMarks: 1,
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

const contestTwo: ContestConfig = {
  reference: 'contest-2',
  markingType: {
    minMarks: 1,
    maxMarks: 2,
    encoding: {
      codeSize: 1,
      maxSize: 2,
      cryptogramCount: 1
    }
  },
  resultType: {
    name: 'does not matter right now'
  },
  title: { en: 'Contest 2' },
  subtitle: { en: 'Contest 2' },
  description: { en: 'Contest 2' },
  options: [
    {
      reference: 'option-a',
      code: 1,
      title: { en: 'Option a' },
      subtitle: { en: 'Option a' },
      description: { en: 'Option a' },
    }
  ]
}

describe('validateContestSelection', () => {
  context('when given a valid contest selection', () => {
    const contestSelection = {
      reference: 'contest-1',
      optionSelections: [
        { reference: 'option-1' }
      ]
    }
    it('does not throw error', () => {
      expect(() => {
        validateContestSelection( contestOne, contestSelection )
      }).to.not.throw()
    })
  })

  context('when given a contest selection with wrong reference', () => {
    const contestSelection = {
      reference: 'wrong-contest-reference',
      optionSelections: [
        { reference: 'option-1' }
      ]
    }
    it('does not throw error', () => {
      expect(() => {
        validateContestSelection( contestOne, contestSelection )
      }).to.throw(CorruptSelectionError, 'Contest selection is not matching contest config')
    })
  })
  
  context('when given a contest selection with no selections', () => {
    const contestSelection = {
      reference: 'contest-2',
      optionSelections: []
    }
    it('does not throw error', () => {
      expect(() => {
        validateContestSelection( contestTwo, contestSelection )
      }).to.throw(CorruptSelectionError, 'Contest selection does not contain a valid amount of option selections')
    })
  })

  context('when given a contest selection with two selections', () => {
    const contestSelection = {
      reference: 'contest-2',
      optionSelections: []
    }
    it('does not throw error', () => {
      expect(() => {
        validateContestSelection( contestTwo, contestSelection )
      }).to.throw(CorruptSelectionError, 'Contest selection does not contain a valid amount of option selections')
    })
  })

  context('when given a contest selection with wrong options', () => {
    const contestSelection = {
      reference: 'contest-1',
      optionSelections: [
        { reference: 'option-2' }
      ]
    }
    it('does not throw error', () => {
      expect(() => {
        validateContestSelection( contestOne, contestSelection )
      }).to.throw(CorruptSelectionError, 'Option config not found')
    })
  })


  context('using contest where up to 2 options can be selected', () => {
    context('when given a contest selection with duplicate option selections', () => {
      const contestSelection = {
        reference: 'contest-2',
        optionSelections: [
          { reference: 'option-a' },
          { reference: 'option-a' }
        ]
      }
      it('does not throw error', () => {
        expect(() => {
          validateContestSelection( contestTwo, contestSelection )
        }).to.throw(CorruptSelectionError, 'Same option slected multiple times')
      })
    })
  })
})

describe('validateBallotSelection', () => {
  const ballotConfig: BallotConfig = {
    reference: 'ballot-1',
    voterGroup: '4',
    contestReferences: [
      'contest-1',
      'contest-2'
    ]
  }
  
  const contestConfigs: ContestConfigMap = {
    [contestOne.reference]: contestOne,
    [contestTwo.reference]: contestTwo
  }
  

  context('when given a valid ballot selection', () => {
    const ballotSelection: BallotSelection = {
      reference: 'ballot-1',
      contestSelections: [
        {
          reference: 'contest-1',
          optionSelections: [
            { reference: 'option-1' }
          ]
        },
        {
          reference: 'contest-2',
          optionSelections: [
            { reference: 'option-a' }
          ]
        }
      ]
    }

    it('does not throw errors', () => {
      expect(() => {
        validateBallotSelection(ballotConfig, contestConfigs, ballotSelection)
      }).to.not.throw()
    })
  })
  context('when given a ballot selection with wrong reference', () => {
    const ballotSelection: BallotSelection = {
      reference: 'wrong-reference',
      contestSelections: [
        {
          reference: 'contest-1',
          optionSelections: [
            { reference: 'option-1' }
          ]
        },
        {
          reference: 'contest-2',
          optionSelections: [
            { reference: 'option-a' }
          ]
        }
      ]
    }

    it('throws errors', () => {
      expect(() => {
        validateBallotSelection( ballotConfig, contestConfigs, ballotSelection)
      }).to.throw(CorruptSelectionError, 'Ballot selection does not match ballot config')
    })
  })
  context('when given ballot selection with missing contests', () => {
    context('when given a valid ballot selection', () => {
      const ballotSelection: BallotSelection = {
        reference: 'ballot-1',
        contestSelections: [
          {
            reference: 'contest-1',
            optionSelections: [
              { reference: 'option-1' }
            ]
          }
        ]
      }
  
      it('throws errors', () => {
        expect(() => {
          validateBallotSelection( ballotConfig, contestConfigs, ballotSelection)
        }).to.throw(CorruptSelectionError, 'Contest selections does not match the contests allowed by the ballot')
      })
    })

    context('when given a ballot selection with duplicate contest votes', () => {
      const ballotSelection: BallotSelection = {
        reference: 'ballot-1',
        contestSelections: [
          {
            reference: 'contest-1',
            optionSelections: [
              { reference: 'option-1' }
            ]
          },
          {
            reference: 'contest-1',
            optionSelections: [
              { reference: 'option-1' }
            ]
          }
        ]
      }
  
      it('throws errors', () => {
        expect(() => {
          validateBallotSelection( ballotConfig, contestConfigs, ballotSelection)
        }).to.throw(CorruptSelectionError, 'Contest selections does not match the contests allowed by the ballot')
      })
    })
  })
})
