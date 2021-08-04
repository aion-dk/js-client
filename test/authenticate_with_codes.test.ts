import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import { deterministicRandomWords, deterministicMathRandom, resetDeterministicOffset } from './test_helpers';
import sinon = require('sinon');
const sjcl = require('../lib/av_client/sjcl')

describe('AVClient#authenticateWithCodes', function() {
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

  context('given valid election codes', function() {
    beforeEach(function() {
      nock('http://localhost:3000/').get('/test/app/config')
        .replyWithFile(200, __dirname + '/replies/config.valid.json');
      nock('http://localhost:3000/').post('/test/app/sign_in')
        .replyWithFile(200, __dirname + '/replies/sign_in.valid.json');
      nock('http://localhost:3000/').post('/test/app/challenge_empty_cryptograms')
        .replyWithFile(200, __dirname + '/replies/challenge_empty_cryptograms.valid.json');
    });

    it('returns success', async function() {
      const validCodes = ['aAjEuD64Fo2143'];
      const result = await client.authenticateWithCodes(validCodes);
      expect(result).to.equal('Success');
    });
  });

  context('given invalid election codes', function() {
    beforeEach(function() {
      nock('http://localhost:3000/').get('/test/app/config')
        .replyWithFile(200, __dirname + '/replies/config.valid.json');
      nock('http://localhost:3000/').post('/test/app/sign_in')
        .replyWithFile(200, __dirname + '/replies/avx_error.invalid_3.json');
    });

    it('returns an error', async function() {
      const invalidCodes = ['no', 'no'];
      return client.authenticateWithCodes(invalidCodes).then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => expect(error).to.equal('No ballots found for the submitted election codes')
      )
    });
  });
});
