import { AVVerifier } from '../../lib/av_verifier';
import { expect } from 'chai';
import nock = require('nock');
import { prepareRecording } from '../mock_helpers'
const { useRecordedResponse } = prepareRecording('benaloh_flow')
import { bulletinBoardHost, expectError } from '../test_helpers'
import { InvalidTrackingCodeError } from '../../lib/av_client/errors';
import { BulletinBoard } from '../../lib/av_client/connectors/bulletin_board';
import { hexToShortCode } from '../../lib/av_client/short_codes';

describe('findBallot', () => {
  let verifier: AVVerifier;
  let expectedNetworkRequests : nock.Scope[] = [];

  beforeEach(async () => {
    expectedNetworkRequests = [
      useRecordedResponse(bulletinBoardHost, 'get', '/dbb/us/api/election_config')
    ]

    verifier = new AVVerifier(bulletinBoardHost + 'dbb/us/api');
    await verifier.initialize()
  });

  context('given valid tracking code', () => {    
    let shortAddress = ""
    before(async () => {
      expectedNetworkRequests.push(useRecordedResponse(bulletinBoardHost, 'get', '/dbb/us/api/verification/vote_track'));
      const bulletinBoard = new BulletinBoard(bulletinBoardHost + 'dbb/us/api/');
      const result = await bulletinBoard.getVotingTrack('test')
      shortAddress = hexToShortCode(result.data.verificationTrackStart.shortAddress)
    })

    it('finds a ballot', async () => {
      expectedNetworkRequests.push(useRecordedResponse(bulletinBoardHost, 'get', '/dbb/us/api/verification/vote_track'));
      const cryptogramAddress = await verifier.findBallot(shortAddress)
      expect(cryptogramAddress.length).to.eql(64)
    });
  });

  context('given non-base58 tracking code', () => {
    it('throws error', async () => {
      await expectError(
        verifier.findBallot('tracking-code'),
        Error,
        'Non-base58 character'
      );
    });    
  });

  context('given non-matching tracking code', () => {
    it('throws "InvalidTrackingCodeError" error', async () => {
      expectedNetworkRequests.push(useRecordedResponse(bulletinBoardHost, 'get', '/dbb/us/api/verification/vote_track'));
      await expectError(
        verifier.findBallot('test'),
        InvalidTrackingCodeError,
        "Tracking code and short address from respose doesn't match"
      );
    });    
  });

  context('given too long tracking code', () => {
    it('throws "InvalidTrackingCodeError" error', async () => {
      await expectError(
        verifier.findBallot('dddddddddddddddddddddddddddddddddddddddddd'),
        InvalidTrackingCodeError,
        'Invalid input. Only up to 40 bits are supported.'
      );
    });    
  });
});
