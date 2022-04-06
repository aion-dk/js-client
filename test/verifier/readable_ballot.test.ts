import { AVVerifier } from '../../lib/av_verifier';
import { expect } from 'chai';
import nock = require('nock');
import { prepareRecording } from '../mock_helpers'
const { useRecordedResponse } = prepareRecording('benaloh_flow')
import { bulletinBoardHost } from '../test_helpers'
import { InvalidContestError, InvalidOptionError } from '../../lib/av_client/errors';

describe('getReadbleBallot', () => {
  let verifier: AVVerifier;
  let expectedNetworkRequests : nock.Scope[] = [];

  beforeEach(async () => {
    expectedNetworkRequests = [
      useRecordedResponse(bulletinBoardHost, 'get', '/dbb/us/api/election_config')
    ]

    verifier = new AVVerifier(bulletinBoardHost + 'dbb/us/api');
    await verifier.initialize()
  });

  context('given valid ballot', () => {
    const decryptedBallot = {
      'contest ref 1': 'option ref 1',
      'contest ref 2': 'option ref 3'
    };

    it('returns a readable ballot', async () => {
      const readableBallot = verifier.getReadableBallot(decryptedBallot, "en")
      expect(readableBallot).to.eql({ 'First ballot': 'Option 1', 'Second ballot': 'Option 3' })
    });
  });

  context('given a contest thats not present  in the election config', () => {
    const decryptedBallot = {
      'not present': 'option ref 1',
      'contest ref 2': 'option ref 3'
    };

    it('throws an "InvalidContestError"', async () => {
      expect(() => verifier.getReadableBallot(decryptedBallot, "en")).to.throw(InvalidContestError, "Contest is not present in the election")
    });
  });

  context('given a option thats not present in the contest', () => {
    const decryptedBallot = {
      'contest ref 1': 'not present',
      'contest ref 2': 'option ref 3'
    };
    
    it('throws an "InvalidOptionError"', async () => {
      expect(() => verifier.getReadableBallot(decryptedBallot, "en")).to.throw(InvalidOptionError, "Option is not present in the contest")
    });
  });
});
