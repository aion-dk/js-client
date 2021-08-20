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

  context('OTP services work', function() {
    it('returns "OK"', async function() {
      expectedNetworkRequests.push(
        nock('http://localhost:1234/').post('/create_session')
          .reply(200)
      );
      expectedNetworkRequests.push(
        nock('http://localhost:1234/').post('/start_identification')
          .reply(200)
      );

      const pii = 'pii';
      return client.requestAccessCode(pii).then(
        (result) => {
          expect(result).to.eql('OK');
          expectedNetworkRequests.forEach((mock) => mock.done());
        },
        (error) => {
          console.error(error);
          expect.fail('Expected a resolved promise');
        }
      );
    });
  });

  context('OTP service is unavailable', function() {
    it('returns an error', async function() {
      expectedNetworkRequests.push(
        nock('http://localhost:1234/').post('/create_session')
          .reply(404)
      );

      const pii = 'pii';
      return await client.requestAccessCode(pii).then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => {
          expect(error.message).to.equal('Request failed with status code 404')
          expectedNetworkRequests.forEach((mock) => mock.done());
        }
      );
    });
  });
});