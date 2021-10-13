import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import {
  resetDeterminism,
  bulletinBoardHost,
  OTPProviderHost,
  voterAuthorizerHost
} from './test_helpers';
import { recordResponses } from './test_helpers'

const USE_MOCK = true;

describe('entire voter flow using OTP authorization', () => {
  let sandbox;
  let expectedNetworkRequests : any[] = [];

  beforeEach(() => {
    sandbox = resetDeterminism();

    if(USE_MOCK) {
      expectedNetworkRequests = [];
      expectedNetworkRequests.push(nock(bulletinBoardHost).get('/test/app/config')
        .replyWithFile(200, __dirname + '/replies/otp_flow/get_test_app_config.json'));
      expectedNetworkRequests.push(nock(voterAuthorizerHost).post('/create_session')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_create_session.json'));
      expectedNetworkRequests.push(nock(voterAuthorizerHost).post('/request_authorization')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_request_authorization.json'));
      expectedNetworkRequests.push(nock(OTPProviderHost).post('/authorize')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_authorize.json'));
      expectedNetworkRequests.push(nock(bulletinBoardHost).post('/test/app/register')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_test_app_register.json'));
      expectedNetworkRequests.push(nock(bulletinBoardHost).post('/test/app/challenge_empty_cryptograms')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_test_app_challenge_empty_cryptograms.json'));
      expectedNetworkRequests.push(nock(bulletinBoardHost).get('/test/app/get_latest_board_hash')
        .replyWithFile(200, __dirname + '/replies/otp_flow/get_test_app_get_latest_board_hash.json'));
      expectedNetworkRequests.push(nock(bulletinBoardHost).post('/test/app/submit_votes')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_test_app_submit_votes.json'));
    }
  });

  afterEach(() => {
    sandbox.restore();
    if(USE_MOCK)
      nock.cleanAll();
  });

  it('returns a receipt', async () => {
    // return await recordResponses(async function() {
      const client = new AVClient('http://localhost:3000/test/app');
      await client.initialize()

      await client.requestAccessCode('123', 'us-voter-123@aion.dk').catch((e) => {
        console.error(e);
        expect.fail('AVClient#requestAccessCode failed.');
      });

      const confirmationToken = await client.validateAccessCode('1234').catch((e) => {
        console.error(e);
        expect.fail('AVClient#validateAccessCode failed');
      });

      await client.registerVoter().catch((e) => {
        console.error(e);
        expect.fail('AVClient#registerVoter failed');
      })

      const cvr = { '1': 'option1', '2': 'optiona' };
      const trackingCode = await client.constructBallotCryptograms(cvr).catch((e) => {
        console.error(e);
        expect.fail('AVClient#constructBallotCryptograms failed');
      });
      expect(trackingCode.length).to.eql(64)

      const affidavit = Buffer.from('some bytes, most likely as binary PDF').toString('base64');
      const receipt = await client.submitBallotCryptograms(affidavit);

      expect(receipt).to.have.keys(
        'boardHash',
        'previousBoardHash',
        'registeredAt',
        'serverSignature',
        'voteSubmissionId'
      )
      expect(receipt.previousBoardHash.length).to.eql(64)

      if(USE_MOCK)
        expectedNetworkRequests.forEach((mock) => mock.done());
    // });
  })
});
