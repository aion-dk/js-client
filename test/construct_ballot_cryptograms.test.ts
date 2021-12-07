import { AVClient } from '../lib/av_client';
import { CorruptCvrError } from '../lib/av_client/errors';
import { expect } from 'chai';
import nock = require('nock');
import {
  expectError,
  resetDeterminism,
  bulletinBoardHost,
  OTPProviderHost,
  voterAuthorizerHost
} from './test_helpers';

describe('AVClient#constructBallotCryptograms', () => {
  let client: AVClient;
  let sandbox;

  beforeEach(async () => {
    sandbox = resetDeterminism();

    nock(bulletinBoardHost).get('/mobile-api/us/config')
      .replyWithFile(200, __dirname + '/replies/otp_flow/get_us_app_config.json');
    nock(voterAuthorizerHost).post('/create_session')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_create_session.json');
    nock(voterAuthorizerHost).post('/request_authorization')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_request_authorization.json');

    nock(OTPProviderHost).post('/authorize')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_authorize.json');

    nock(bulletinBoardHost).post('/mobile-api/us/register')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_us_app_register.json');
    nock(bulletinBoardHost).post('/mobile-api/us/challenge_empty_cryptograms')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_us_app_challenge_empty_cryptograms.json');
    nock(bulletinBoardHost).get('/mobile-api/us/get_latest_board_hash')
      .replyWithFile(200, __dirname + '/replies/otp_flow/get_us_app_get_latest_board_hash.json');

    client = new AVClient('http://us-avx:3000/mobile-api/us');
    await client.initialize()
  });

  afterEach(() => {
    sandbox.restore();
    nock.cleanAll();
  });

  context('given previous steps succeeded, and it receives valid values', () => {
    it('encrypts correctly', async () => {
      await client.requestAccessCode('voter123', 'voter@foo.bar');
      await client.validateAccessCode('1234');
      await client.registerVoter()

      const cvr = { '1': 'option1', '2': 'optiona' };

      const trackingCode = await client.constructBallotCryptograms(cvr);

      expect(trackingCode.length).to.eql(64);
    });
  });

  context('given invalid CVR', () => {
    it('encryption fails when voting on invalid contest', async () => {
      await client.requestAccessCode('voter123', 'voter@foo.bar');
      await client.validateAccessCode('1234');
      await client.registerVoter()

      const cvr = { '1': 'option1', '3': 'optiona' };

      await expectError(
        client.constructBallotCryptograms(cvr),
        CorruptCvrError,
        'Corrupt CVR: Contains invalid contest'
      );
    });

    it('encryption fails when voting on invalid option', async () => {
      await client.requestAccessCode('voter123', 'voter@foo.bar');
      await client.validateAccessCode('1234');
      await client.registerVoter()

      const cvr = { '1': 'option1', '2': 'wrong_option' };

      await expectError(
        client.constructBallotCryptograms(cvr),
        CorruptCvrError,
        'Corrupt CVR: Contains invalid option'
      );
    });
  });
});
