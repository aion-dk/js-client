import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import { deterministicRandomWords, deterministicMathRandom, resetDeterministicOffset } from './test_helpers';
import sinon = require('sinon');
const sjcl = require('../lib/av_client/sjcl')
const Crypto = require('../lib/av_client/aion_crypto.js')()

describe('AVClient#validateAccessCode', () => {
  let client;
  let sandbox;
  const expectedNetworkRequests : any[] = [];

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(Math, 'random').callsFake(deterministicMathRandom);
    sandbox.stub(sjcl.prng.prototype, 'randomWords').callsFake(deterministicRandomWords);
    resetDeterministicOffset();

    client = new AVClient('http://localhost:3000/test/app');
    expectedNetworkRequests.push(
      nock('http://localhost:3000/').get('/test/app/config')
        .replyWithFile(200, __dirname + '/replies/otp_flow/get_config.json')
    );
    expectedNetworkRequests.push(
      nock('http://localhost:1234/').post('/create_session')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_create_session.json')
    );
    expectedNetworkRequests.push(
      nock('http://localhost:1234/').post('/start_identification')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_start_identification.json')
    )
  });

  afterEach(() => {
    sandbox.restore();
    nock.cleanAll();
  });

  context('OTP services work', () => {
    it('returns success', async () => {
      expectedNetworkRequests.push(
        nock('http://localhost:1111/').post('/authorize')
          .replyWithFile(200, __dirname + '/replies/otp_flow/post_authorize.json')
      );
      expectedNetworkRequests.push(
        nock('http://localhost:3000/').post('/test/app/register')
          .replyWithFile(200, __dirname + '/replies/otp_flow/post_register.json')
      );
      expectedNetworkRequests.push(
        nock('http://localhost:3000/').post('/test/app/challenge_empty_cryptograms')
          .replyWithFile(200, __dirname + '/replies/otp_flow/post_challenge_empty_cryptograms.json')
      );

      await client.requestAccessCode('some PII info');

      const otp = '1234';
      const result = await client.validateAccessCode(otp);

      expect(result).to.equal('OK');
      expectedNetworkRequests.forEach((mock) => mock.done());
    })

    it('fails given invalid otps', async () => {
      expectedNetworkRequests.push(
        nock('http://localhost:1111/').post('/authorize')
          .reply(401) // This is what decides that OTP is invalid
      );

      await client.requestAccessCode('some PII info');

      const otp = '0000';

      return client.validateAccessCode(otp).then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => expect(error.message).to.equal('Request failed with status code 401')
      )
      expectedNetworkRequests.forEach((mock) => mock.done());
    })
  });

  context('given wrong number of OTPs', () => {
    it('fails with an error message', async () => {
      await client.requestAccessCode('some PII info');

      const otps = ['1234', 'abcd'];

      try {
        await client.validateAccessCode(otps);
        expect.fail('Expected error to be thrown');
      } catch(error) {
        expect(error.message).to.equal('Wrong number of OTPs submitted');
      }
    })
  });
});
