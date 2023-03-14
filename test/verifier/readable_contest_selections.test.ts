import { AVVerifier } from '../../lib/av_verifier';
import { expect } from 'chai';
import { bulletinBoardHost } from '../test_helpers'
import { InvalidContestError, InvalidOptionError } from '../../lib/av_client/errors';
import { LatestConfig } from '../../lib/av_client/types';
import latestConfig from '../fixtures/latestConfig';

describe('getReadbleContestSelections', () => {
  let verifier: AVVerifier;
  const config: LatestConfig = latestConfig;

  beforeEach(async () => {
    verifier = new AVVerifier(bulletinBoardHost + 'us');
    await verifier.initialize(config)
  });

  context('given valid ballot', () => {
    const contestSelections = [
      {
        reference: 'contest ref 1',
        optionSelections: [{ reference: 'option ref 1' }]
      },
      {
        reference: 'contest ref 2',
        optionSelections: [{ reference: 'option ref 2' }]
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
              reference: 'option ref 2',
              title: 'Option 2'
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
