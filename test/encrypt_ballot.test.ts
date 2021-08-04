import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import { deterministicRandomWords, deterministicMathRandom, resetDeterministicOffset } from './test_helpers';
import sinon = require('sinon');
const sjcl = require('../lib/av_client/sjcl')

describe('AVClient#encryptBallot', function() {
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
      const fingerprint = await client.encryptBallot(cvr);

      expect(fingerprint).to.equal('5e4d8fe41fa3819cc064e2ace0eda8a847fe322594a6fd5a9a51c699e63804b7');
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
        await client.encryptBallot(cvr);
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
        await client.encryptBallot(cvr);
        expect.fail('Expected error to be thrown');
      } catch(error) {
        expect(error.message).to.equal('Corrupt CVR: Contains invalid option');
      }
    });
  });
});
