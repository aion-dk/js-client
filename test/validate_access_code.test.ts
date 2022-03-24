import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import {
  expectError,
  resetDeterminism,
  bulletinBoardHost,
  OTPProviderHost,
  voterAuthorizerHost,
  bbHost,
  otpHost,
  vaHost
} from './test_helpers';
import { AccessCodeExpired } from '../lib/av_client/errors';


describe('AVClient#validateAccessCode', () => {
  let client: AVClient;
  let sandbox;
  const expectedNetworkRequests : nock.Scope[] = [];

  beforeEach(async () => {
    sandbox = resetDeterminism();

    expectedNetworkRequests.push(bbHost.get_election_config());
    expectedNetworkRequests.push(vaHost.post_create_session());

    client = new AVClient(bulletinBoardHost + 'dbb/us/api');
    await client.initialize()
  });

  afterEach(() => {
    sandbox.restore();
    nock.cleanAll();
  });

  context('OTP services & Bulletin Board work as expected', () => {
    it('resolves without errors', async () => {
      expectedNetworkRequests.push(otpHost.post_authorize());
      expectedNetworkRequests.push(vaHost.post_request_authorization());
      expectedNetworkRequests.push(bbHost.post_registrations());

      // TODO: DEPRECATED DUE TO NEW STRUCTURE?
      // expectedNetworkRequests.push(
      //   nock(bulletinBoardHost).post('/mobile-api/us/challenge_empty_cryptograms')
      //     .replyWithFile(200, __dirname + '/replies/otp_flow/post_us_app_challenge_empty_cryptograms.json')
      // );

      const otp = '1234';
      const email = 'blabla@aion.dk';

      await client.requestAccessCode('voter123', email);
      const result = await client.validateAccessCode(otp);
      await client.registerVoter();

      expect(result).to.equal(undefined);
      expectedNetworkRequests.forEach((mock) => mock.done());
    })
  });

  context('expired OTP', () => {
    it('fails given expired OTP', async () => {
      expectedNetworkRequests.push(
        nock(OTPProviderHost).post('/authorize')
          .reply(403, { errorCode: 'OTP_SESSION_TIMED_OUT' })
      );

      const otp = '1234';
      const email = 'blabla@aion.dk';

      await client.requestAccessCode('voter123', email);

      await expectError(
        client.validateAccessCode(otp),
        AccessCodeExpired,
        'OTP code expired'
      );
      expectedNetworkRequests.forEach((mock) => mock.done());
    });
  });

  context('OTP services work, Bulletin Board routing changed', () => {
    it('returns an error', async () => {
      expectedNetworkRequests.push(
        nock(OTPProviderHost).post('/authorize')
          .replyWithFile(200, __dirname + '/replies/otp_flow/post_authorize.json')
      );
      expectedNetworkRequests.push(
        nock(voterAuthorizerHost).post('/request_authorization')
          .replyWithFile(200, __dirname + '/replies/otp_flow/post_request_authorization.json')
      );
      expectedNetworkRequests.push(
        nock(bulletinBoardHost).post('/dbb/us/api/registrations')
          .reply(404)
      );

      const otp = '1234';
      const email = 'blabla@aion.dk';

      await client.requestAccessCode('voter123', email);
      await client.validateAccessCode(otp);

      await expectError(
        client.registerVoter(),
        Error,
        'Request failed with status code 404'
      );
      expectedNetworkRequests.forEach((mock) => mock.done());
    })
  });
});
