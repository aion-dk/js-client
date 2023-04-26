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
        piles: [{
          multiplier: 1,
          optionSelections: [{ reference: "option ref 1" }],
        }]
      },
      {
        reference: 'contest ref 2',
        piles: [{
          multiplier: 1,
          optionSelections: [{
            reference: 'option ref 2',
            text: 'John Doe'
          }],
        }]
      },
    ]

    it('returns a readable ballot', async () => {
      const readableContestSelections = verifier
        .getReadableContestSelections(contestSelections, "en")
      expect(readableContestSelections).to.eql([
        {
          reference: 'contest ref 1',
          title: 'First ballot',
          piles: [{
            multiplier: 1,
            optionSelections: [
              {
                reference: 'option ref 1',
                text: undefined,
                title: 'Option 1'
              }
            ]
          }]
        },
        {
          reference: 'contest ref 2',
          title: 'Second ballot',
          piles: [{
            multiplier: 1,
            optionSelections: [
              {
                reference: 'option ref 2',
                text: 'John Doe',
                title: 'Option 2'
              }
            ]
          }]
        },
      ])
    });
  });

  context('given a contest thats not present in the election config', () => {
    const contestSelections = [
      {
        reference: 'not present',
        piles: [{
          multiplier: 1,
          optionSelections: [{ reference: "option ref 1" }],
        }]
      },
      {
        reference: 'contest ref 2',
        piles: [{
          multiplier: 1,
          optionSelections: [{ reference: "option ref 3" }],
        }]
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
        piles: [{
          multiplier: 1,
          optionSelections: [{ reference: "not present" }],
        }]
      },
      {
        reference: 'contest ref 2',
        piles: [{
          multiplier: 1,
          optionSelections: [{ reference: "option ref 3" }],
        }]
      },
    ]

    it('throws an "InvalidOptionError"', async () => {
      expect(() => {
        verifier.getReadableContestSelections(contestSelections, "en")
      }).to.throw(InvalidOptionError, "Option could not be found")
    });
  });
});
