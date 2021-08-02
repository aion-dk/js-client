import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import { deterministicRandomWords, deterministicMathRandom, resetDeterministicOffset } from './av_client_test_helpers';
import sinon = require('sinon');
const sjcl = require('../lib/av_client/sjcl')

describe('AVClient#encryptVotes', function() {
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

  context('encrypt vote', function() {
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
      const contestSelections = { '1': 'option1', '2': 'optiona' };
      const expectedContestCryptograms = {
        '1': '0211dd2017252b4c290a60faa84170e00098e8abccbfae557b5446be984eb7262a,02c56fc8f37c8d317b80e041e5f8e2072aac0a81fae0454cb750296ea70c7717e4',
        '2': '0348cdf39918c92e080f0b8089a51706672ae86b545b4d46afc955c93a5d6af1b2,02944d1cebaa70e2e61e529bee2b338513b19e8bc0b6eac2a572a07ca1ea3b8f7f'
      };

      await client.authenticateWithCodes(validCodes);
      const encryptResponse = client.encryptContestSelections(contestSelections);
      const cryptograms = client.cryptogramsForConfirmation();

      expect(encryptResponse).to.equal('Success');
      expect(cryptograms).to.deep.equal(expectedContestCryptograms);
    });
  });
});
