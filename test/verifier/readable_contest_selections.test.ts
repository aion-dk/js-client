import { AVVerifier } from '../../lib/av_verifier';
import { expect } from 'chai';
import { bulletinBoardHost } from '../test_helpers'
import { InvalidContestError, InvalidOptionError } from '../../lib/av_client/errors';
import { NewContestConfigMap } from '../../lib/av_client/types';

const contestConfigs: NewContestConfigMap = {
  "contest ref 1": {
    content: {
      "reference": "contest ref 1",
      "markingType": {
        "minMarks": 1,
        "maxMarks": 1,
        "blankSubmission": "disabled",
        "encoding": {
          "codeSize": 1,
          "maxSize": 1,
          "cryptogramCount": 1
        }
      },
      "options": [
        {
          "reference": "option ref 1",
          "code": 1,
          "title": {
            "en": "Option 1"
          },
          "subtitle": {},
          "description": {},
        },
        {
          "reference": "option ref 2",
          "code": 2,
          "title": {
            "en": "Option 2"
          },
          "subtitle": {},
          "description": {},
        }
      ],
      "title": {
        "en": "First ballot"
      },
      "subtitle": {},
      "description": {},
      "resultType": {
        "name": "resultType name not matter right now"
      }
    }
  },
  "contest ref 2": {
    content: {
      "reference": "contest ref 2",
      "markingType": {
        "minMarks": 1,
        "maxMarks": 1,
        "blankSubmission": "disabled",
        "encoding": {
          "codeSize": 1,
          "maxSize": 1,
          "cryptogramCount": 1
        }
      },
      "options": [
        {
          "reference": "option ref 3",
          "code": 1,
          "title": {
            "en": "Option 3"
          },
          "subtitle": {},
          "description": {},
        },
        {
          "reference": "option ref 4",
          "code": 2,
          "title": {
            "en": "Option 4"
          },
          "subtitle": {},
          "description": {},
        },
        {
          "reference": "option ref 5",
          "code": 3,
          "title": {
            "en": "Option 5"
          },
          "subtitle": {},
          "description": {},
        }
      ],
      "title": {
        "en": "Second ballot"
      },
      "subtitle": {},
      "description": {},
      "resultType": {
        "name": "resultType name not matter right now"
      }
    }
  }
}

const minimalElectionConfig = {
  "encryptionKey": "03bbb6c547fa7f8e144f1940159306de7fcde0161925be9e58dbf0d6b17a9e07a8",
  "contestConfigs": contestConfigs
}

describe('getReadbleContestSelections', () => {
  let verifier: AVVerifier;

  beforeEach(async () => {
    verifier = new AVVerifier(bulletinBoardHost + 'us');
    await verifier.initialize(minimalElectionConfig)
  });

  context('given valid ballot', () => {
    const contestSelections = [
      {
        reference: 'contest ref 1',
        optionSelections: [{ reference: 'option ref 1' }]
      },
      {
        reference: 'contest ref 2',
        optionSelections: [{ reference: 'option ref 3' }]
      },
    ]

    it('returns a readable ballot', async () => {
      const readableContestSelections = verifier.getReadableContestSelections(contestSelections, "en")
      expect(readableContestSelections).to.eql([
        {
          reference: 'contest ref 1',
          title: 'First ballot',
          optionSelections: [
            { 
              reference: 'option ref 1',
              title: 'Option 1'
            }
        ]
        },
        {
          reference: 'contest ref 2',
          title: 'Second ballot',
          optionSelections: [
            { 
              reference: 'option ref 3',
              title: 'Option 3'
            }
          ]
        },
      ])
    });
  });

  context('given a contest thats not present  in the election config', () => {
    const contestSelections = [
      {
        reference: 'not present',
        optionSelections: [{ reference: 'option ref 1' }]
      },
      {
        reference: 'contest ref 2',
        optionSelections: [{ reference: 'option ref 3' }]
      },
    ]
    
    it('throws an "InvalidContestError"', async () => {
      expect(() => {
        verifier.getReadableContestSelections(contestSelections, "en")
      }).to.throw(InvalidContestError, "Contest is not present in the election")
    });
  });

  context('given a option thats not present in the contest', () => {
    const contestSelections = [
      {
        reference: 'contest ref 1',
        optionSelections: [{ reference: 'not present' }]
      },
      {
        reference: 'contest ref 2',
        optionSelections: [{ reference: 'option ref 3' }]
      },
    ]
    
    it('throws an "InvalidOptionError"', async () => {
      expect(() => {
        verifier.getReadableContestSelections(contestSelections, "en")
      }).to.throw(InvalidOptionError, "Option could not be found")
    });
  });
});
