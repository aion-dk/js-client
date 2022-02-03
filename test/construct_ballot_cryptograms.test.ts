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

    nock(bulletinBoardHost).get('/dbb/us/api/election_config')
      .replyWithFile(200, __dirname + '/replies/otp_flow/get_dbb_api_us_config.json');

    nock(voterAuthorizerHost).post('/create_session')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_create_session.json');

    nock(voterAuthorizerHost).post('/request_authorization')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_request_authorization.json');

    nock(OTPProviderHost).post('/authorize')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_authorize.json');

    nock(bulletinBoardHost).post('/dbb/us/api/registrations')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_dbb_api_us_register.json');


    client = new AVClient('http://us-avx:3000/dbb/us/api');
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

      const cvr = {
        '50422d0f-e795-4324-8289-50e3d3459196': '1',
        'd866a7d7-15df-4765-9950-651c0ca1313d': '2'
      };

      const trackingCode = await client.constructBallotCryptograms(cvr);

      // expect(trackingCode.length).to.eql(64);
    });
  });

  context('given invalid CVR', () => {
    it('cvr not matching voter group eligibility', async () => {
      await client.requestAccessCode('voter123', 'voter@foo.bar');
      await client.validateAccessCode('1234');
      await client.registerVoter()

      const cvr = { '1': 'option1', '3': 'optiona' };

      await expectError(
        client.constructBallotCryptograms(cvr),
        CorruptCvrError,
        'Corrupt CVR: Not eligible'
      );
    });

    it('encryption fails when voting on invalid option', async () => {
      await client.requestAccessCode('voter123', 'voter@foo.bar');
      await client.validateAccessCode('1234');
      await client.registerVoter()

      const cvr = {
        '50422d0f-e795-4324-8289-50e3d3459196': '1',
        'd866a7d7-15df-4765-9950-651c0ca1313d': '3'
      };

      await expectError(
        client.constructBallotCryptograms(cvr),
        CorruptCvrError,
        'Corrupt CVR: Contains invalid option'
      );
    });
  });
});
