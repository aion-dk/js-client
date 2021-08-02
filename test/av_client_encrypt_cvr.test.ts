import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import { deterministicRandomWords, deterministicMathRandom, resetDeterministicOffset } from './av_client_test_helpers';
import sinon = require('sinon');
const sjcl = require('../lib/av_client/sjcl')

describe('AVClient#encryptCVR', function() {
  let client;
  let sandbox;

  beforeEach(function() {
    client = new AVClient('http://localhost:3000/test/app');

    sandbox = sinon.createSandbox();
    sandbox.stub(Math, 'random').callsFake(deterministicMathRandom);
    sandbox.stub(sjcl.prng.prototype, 'randomWords').callsFake(deterministicRandomWords);
    resetDeterministicOffset();
  });

  afterEach( function() {
    sandbox.restore();
    nock.cleanAll();
  })

  context('given valid values', function() {
    beforeEach(function() {
      nock('http://localhost:3000/').get('/test/app/config')
        .replyWithFile(200, __dirname + '/replies/config.valid.json');
      nock('http://localhost:3000/').post('/test/app/sign_in')
        .replyWithFile(200, __dirname + '/replies/sign_in.valid.json');
      nock('http://localhost:3000/').post('/test/app/challenge_empty_cryptograms')
        .replyWithFile(200, __dirname + '/replies/challenge_empty_cryptograms.valid.json');
    });

    it('encrypts correctly', async function() {
      const validCodes = ['aAjEuD64Fo2143'];
      const cvr = { '1': 'option1', '2': 'optiona' };

      await client.authenticateWithCodes(validCodes);
      const fingerprint = await client.encryptCVR(cvr);
      const cryptograms = client.cryptogramsForConfirmation();

      expect(fingerprint).to.equal('5e4d8fe41fa3819cc064e2ace0eda8a847fe322594a6fd5a9a51c699e63804b7');
      expect(cryptograms).to.eql({
        '1': '0211dd2017252b4c290a60faa84170e00098e8abccbfae557b5446be984eb7262a,02c56fc8f37c8d317b80e041e5f8e2072aac0a81fae0454cb750296ea70c7717e4',
        '2': '0348cdf39918c92e080f0b8089a51706672ae86b545b4d46afc955c93a5d6af1b2,02944d1cebaa70e2e61e529bee2b338513b19e8bc0b6eac2a572a07ca1ea3b8f7f'
      });
    });
  });

  context('given invalid CVR', function() {
    beforeEach(function() {
      nock('http://localhost:3000/').get('/test/app/config')
        .replyWithFile(200, __dirname + '/replies/config.valid.json');
      nock('http://localhost:3000/').post('/test/app/sign_in')
        .replyWithFile(200, __dirname + '/replies/sign_in.valid.json');
      nock('http://localhost:3000/').post('/test/app/challenge_empty_cryptograms')
        .replyWithFile(200, __dirname + '/replies/challenge_empty_cryptograms.valid.json');
    });

    it('encryption fails when voting on invalid contest', async function() {
      const validCodes = ['aAjEuD64Fo2143'];
      const cvr = { '1': 'option1', '3': 'optiona' };

      await client.authenticateWithCodes(validCodes);

      try {
        await client.encryptCVR(cvr);
        expect.fail('Expected error to be thrown');
      } catch(error) {
        expect(error.message).to.equal('Corrupt CVR: Contains invalid contest');
      }
    });

    it('encryption fails when voting on invalid option', async function() {
      const validCodes = ['aAjEuD64Fo2143'];
      const cvr = { '1': 'option1', '2': 'wrong_option' };

      await client.authenticateWithCodes(validCodes);

      try {
        await client.encryptCVR(cvr);
        expect.fail('Expected error to be thrown');
      } catch(error) {
        expect(error.message).to.equal('Corrupt CVR: Contains invalid option');
      }
    });
  });
});
