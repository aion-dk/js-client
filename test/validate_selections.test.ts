import { validateBallotSelection, validateContestSelection } from '../lib/av_client/validate_selections'
import { expect } from 'chai'
import { NewContestConfig, BallotSelection, NewBallotConfig, NewContestConfigMap } from '../lib/av_client/types'
import { CorruptSelectionError } from '../lib/av_client/errors'

const contestOne: NewContestConfig = {
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
      },
      {
        reference: 'option-3',
        code: 3,
        title: { en: 'Option 3' },
        subtitle: { en: 'Option 3' },
        description: { en: 'Option 3' },
      }
    ]
  }
}

const contestTwo: NewContestConfig = {
  content: {
    reference: 'contest-2',
    markingType: {
      minMarks: 1,
      maxMarks: 2,
      blankSubmission: "active_choice",
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

    it('throws an error', () => {
      expect(() => {
        validateContestSelection( contestOne, contestSelection )
      }).to.throw(CorruptSelectionError, 'Contest selection is not matching contest config')
    })
  })
  
  context('when given a contest selection with no selections and blank disabled', () => {
    const contestSelection = {
      reference: 'contest-1',
      optionSelections: []
    }

    it('throws an error', () => {
      expect(() => {
        validateContestSelection( contestOne, contestSelection )
      }).to.throw(CorruptSelectionError, 'Blank submissions are not allowed in this contest')
    })
  })

  context('when given a contest selection with no selections and blank enabled', () => {
    const contestSelection = {
      reference: 'contest-2',
      optionSelections: []
    }

    it('does not throw an error', () => {
      expect(() => {
        validateContestSelection( contestTwo, contestSelection )
      }).to.not.throw()
    })
  })

  context('when given a contest selection with two selections', () => {
    const contestSelection = {
      reference: 'contest-1',
      optionSelections: [{ reference: 'option-1' },
        { reference: 'option-3' }]
    }

    it('throws an error', () => {
      expect(() => {
        validateContestSelection( contestOne, contestSelection )
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

    it('throws an error', () => {
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

      it('throws an error', () => {
        expect(() => {
          validateContestSelection( contestTwo, contestSelection )
        }).to.throw(CorruptSelectionError, 'Same option selected multiple times')
      })
    })
  })
})

describe('validateBallotSelection', () => {
  const ballotConfig: NewBallotConfig = {
    content: {
      reference: 'ballot-1',
      voterGroup: '4',
      contestReferences: [
        'contest-1',
        'contest-2'
      ]
    }
  }

  const contestConfigs: NewContestConfigMap = {
    [contestOne.content.reference]: contestOne,
    [contestTwo.content.reference]: contestTwo
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
        }).to.throw(CorruptSelectionError, 'Contest selections do not match the contests allowed by the ballot')
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
        }).to.throw(CorruptSelectionError, 'Contest selections do not match the contests allowed by the ballot')
      })
    })
  })
})
