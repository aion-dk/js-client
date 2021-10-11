import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import {
  deterministicRandomWords,
  deterministicMathRandom,
  resetDeterministicOffset,
  bulletinBoardHost,
  OTPProviderHost,
  voterAuthorizerHost
} from './test_helpers';
import sinon = require('sinon');
import { AccessCodeExpired, AccessCodeInvalid, BulletinBoardError, NetworkError, UnsupportedServerReplyError } from '../lib/av_client/errors';

const sjcl = require('../lib/av_client/sjcl')

describe('AVClient#validateAccessCode', () => {
  let client: AVClient;
  let sandbox;
  const expectedNetworkRequests : any[] = [];

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    sandbox.stub(Math, 'random').callsFake(deterministicMathRandom);
    sandbox.stub(sjcl.prng.prototype, 'randomWords').callsFake(deterministicRandomWords);
    resetDeterministicOffset();

    expectedNetworkRequests.push(
      nock(bulletinBoardHost).get('/test/app/config')
        .replyWithFile(200, __dirname + '/replies/otp_flow/get_test_app_config.json')
    );
    expectedNetworkRequests.push(
      nock(voterAuthorizerHost).post('/create_session')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_create_session.json')
    );

    client = new AVClient('http://localhost:3000/test/app');
    await client.initialize()
  });

  afterEach(() => {
    sandbox.restore();
    nock.cleanAll();
  });

  context('OTP services & Bulletin Board work as expected', () => {
    it('resolves without errors', async () => {
      expectedNetworkRequests.push(
        nock(OTPProviderHost).post('/authorize')
          .replyWithFile(200, __dirname + '/replies/otp_flow/post_authorize.json')
      );
      expectedNetworkRequests.push(
        nock(voterAuthorizerHost).post('/request_authorization')
          .replyWithFile(200, __dirname + '/replies/otp_flow/post_request_authorization.json')
      );
      expectedNetworkRequests.push(
        nock(bulletinBoardHost).post('/test/app/register')
          .replyWithFile(200, __dirname + '/replies/otp_flow/post_test_app_register.json')
      );
      expectedNetworkRequests.push(
        nock(bulletinBoardHost).post('/test/app/challenge_empty_cryptograms')
          .replyWithFile(200, __dirname + '/replies/otp_flow/post_test_app_challenge_empty_cryptograms.json')
      );

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

      return client.validateAccessCode(otp).then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => {
          expect(error).to.be.an.instanceof(AccessCodeExpired);
          expect(error.message).to.equal('OTP code expired')
          expectedNetworkRequests.forEach((mock) => mock.done());
        }
      );
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
        nock(bulletinBoardHost).post('/test/app/register')
          .reply(404)
      );

      const otp = '1234';
      const email = 'blabla@aion.dk';

      await client.requestAccessCode('voter123', email);
      const result = await client.validateAccessCode(otp);
      return client.registerVoter().then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => {
          expect(error).to.be.an.instanceof(Error);
          expect(error.message).to.equal('Request failed with status code 404');
          expectedNetworkRequests.forEach((mock) => mock.done());
        }
      )
    })
  });
});
