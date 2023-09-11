import {expect} from 'chai';
import {constructContestEnvelopes} from '../lib/av_client/construct_contest_envelopes';
import {ContestConfig, BallotConfig, ClientState, VotingRoundConfig, BallotSelection} from '../lib/av_client/types';
import latestConfig from './fixtures/latestConfig';
import {baseItemAttributes} from "./fixtures/itemHelper";

const contestOne: ContestConfig = {
  ...baseItemAttributes(),
  type: 'ContestConfigItem',
  content: {
    reference: 'contest-1',
    markingType: {
      minMarks: 1,
      maxMarks: 1,
      blankSubmission: "disabled",
      votesAllowedPerOption: 1,
      encoding: {
        codeSize: 1,
        maxSize: 1,
        cryptogramCount: 1
      }
    },
    resultType: {
      name: 'does not matter right now'
    },
    title: {en: 'Contest 1'},
    subtitle: {en: 'Contest 1'},
    description: {en: 'Contest 1'},
    options: [
      {
        reference: 'option-1',
        code: 1,
        title: {en: 'Option 1'},
        subtitle: {en: 'Option 1'},
        description: {en: 'Option 1'},
      }
    ]
  }
}

const ballotOne: BallotConfig = {
  ...baseItemAttributes(),
  type: 'BallotConfigItem',
  content: {
    reference: 'ballot-1',
    voterGroup: '1',
    contestReferences: ['contest-1']
  }
}

const votingRoundConfig: VotingRoundConfig = {
  address: "",
  author: "",
  parentAddress: "",
  previousAddress: "",
  content: {
    status: "open",
    reference: "voting-round-1",
    contestReferences: [
      'contest-1',
      'contest-2'
    ]
  },
  registeredAt: "2023-01-11T09:27:11.397Z",
  signature: "120e0bf80ad403fdd07b9accf19aa5f4fbc5746424e552b22cf9c93f1c06f815,0de6cc49f0bb8d4680cc1039e2ce983bd9ee002b3cea196e12efb43eababf5c8",
  type: "VotingRoundConfigItem"
}

const clientState: ClientState = {
  latestConfig: {
    items: {
      thresholdConfig: latestConfig.items.thresholdConfig,
      ballotConfigs: {
        [ballotOne.content.voterGroup]: ballotOne
      },
      contestConfigs: {
        [contestOne.content.reference]: contestOne
      },
      votingRoundConfigs: {
        [votingRoundConfig.content.reference]: votingRoundConfig
      },
      voterAuthorizerConfig: latestConfig.items.voterAuthorizerConfig,
      electionConfig: latestConfig.items.electionConfig,
      genesisConfig: latestConfig.items.genesisConfig,
      latestConfigItem: latestConfig.items.latestConfigItem,
      segmentsConfig: null
    }
  },
  voterSession: {
    ...baseItemAttributes(),
    content: {
      authToken: "string",
      identifier: "string",
      publicKey: "string",
      votingRoundReference: "string",
      weight: 1,
      voterGroup: '1'
    },
    type: "VoterSessionItem"
  },
  votingRoundReference: "voting-round-1"
}

const ballotSelection: BallotSelection = {
  reference: 'ballot-1',
  contestSelections: [
    {
      reference: 'contest-1',
      piles: [{
        multiplier: 1,
        optionSelections: [
          {reference: 'option-1'}
        ]
      }]

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
