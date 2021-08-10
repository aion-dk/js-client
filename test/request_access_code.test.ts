import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import { deterministicRandomWords, deterministicMathRandom, resetDeterministicOffset } from './test_helpers';
import sinon = require('sinon');
const sjcl = require('../lib/av_client/sjcl')
const Crypto = require('../lib/av_client/aion_crypto.js')()

describe('AVClient#requestAccessCode', function() {
  let client;
  let sandbox;
  const expectedNetworkRequests : any[] = [];

  beforeEach(function() {
    sandbox = sinon.createSandbox();
    sandbox.stub(Math, 'random').callsFake(deterministicMathRandom);
    sandbox.stub(sjcl.prng.prototype, 'randomWords').callsFake(deterministicRandomWords);
    resetDeterministicOffset();

    client = new AVClient('http://localhost:3000/test/app');
    expectedNetworkRequests.push(
      nock('http://localhost:3000/').get('/test/app/config')
        .replyWithFile(200, __dirname + '/replies/otp_flow/get_config.json')
    );
  });

  afterEach(function() {
    sandbox.restore();
    nock.cleanAll();
  });

  context('authorized', function() {
    it('returns "Authorized"', async function() {
      expectedNetworkRequests.push(
        nock('http://localhost:1234/').post('/initiate')
          .reply(200),
        nock('http://localhost:1111/').post('/authorize')
          .replyWithFile(200, __dirname + '/replies/otp_provider_authorize.valid.json'),
        nock('http://localhost:3000/').post('/test/app/sign_in')
          .replyWithFile(200, __dirname + '/replies/otp_flow/post_sign_in.json'),
        nock('http://localhost:3000/').post('/test/app/challenge_empty_cryptograms')
          .replyWithFile(200, __dirname + '/replies/otp_flow/post_challenge_empty_cryptograms.json')
      );

      // Initiate
      const pii = 'pii';
      await client.requestAccessCode(pii);

      // Finalize
      const otp = '1234';
      await client.validateAccessCode(otp);

      // Initiating again will just return `true`
      const result = await client.requestAccessCode(pii);
      expect(result).to.equal('Authorized');

      expectedNetworkRequests.forEach((mock) => mock.done());
    });
  });

  context('unauthorized, OTP services work', function() {
    it('returns "Unauthorized"', async function() {
      expectedNetworkRequests.push(
        nock('http://localhost:1234/').post('/initiate')
          .reply(200)
      );

      const pii = 'pii';
      const result = await client.requestAccessCode(pii);

      expect(result).to.equal('Unauthorized')

      expectedNetworkRequests.forEach((mock) => mock.done());
    });
  });

  context('unauthorized, OTP service is unavailable', function() {
    it('returns an error', async function() {
      expectedNetworkRequests.push(
        nock('http://localhost:1234/').post('/initiate')
          .reply(404)
      );

      const pii = 'pii';

      return await client.requestAccessCode(pii).then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => {
          expectedNetworkRequests.forEach((mock) => mock.done());
          expect(error.message).to.equal('Request failed with status code 404')
        }
      );
    });
  });
});
