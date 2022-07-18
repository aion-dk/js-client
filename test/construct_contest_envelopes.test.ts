import { expect } from 'chai';
import { constructContestEnvelopes } from '../lib/av_client/construct_contest_envelopes';
import { ContestConfig, ContestConfigMap, BallotConfigMap } from '../lib/av_client/types';

const contestOne: ContestConfig = {
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

const ballotOne = {
  reference: 'ballot-1',
  voterGroup: '1',
  contestReferences: ['contest-1']
}

const contestConfigs: ContestConfigMap = {
  [contestOne.reference]: contestOne
}

const ballotConfigs: BallotConfigMap = {
  [ballotOne.voterGroup]: ballotOne
}

const clientState = {
  electionConfig: {
    encryptionKey: '',
    ballotConfigs: ballotConfigs,
    contestConfigs: contestConfigs
  },
  voterSession: {
    content: { 
      voterGroup: '1',
    }
  }
}

const ballotSelection = {
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

describe('constructContestEnvelopes', () => {
  context('when given a valid arguments', () => {
    it('encrypts without errors', async () => {
      const result = constructContestEnvelopes(clientState, ballotSelection)
      expect(result).to.have.keys('pedersenCommitment', 'envelopeRandomizers', 'contestEnvelopes')
    })
  })
})
