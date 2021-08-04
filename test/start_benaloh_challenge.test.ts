import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import { deterministicRandomWords, deterministicMathRandom, resetDeterministicOffset } from './test_helpers';
import sinon = require('sinon');
const sjcl = require('../lib/av_client/sjcl')

describe('AVClient#startBenalohChallenge', function() {
  let client;
  let sandbox;

  beforeEach(function() {
    client = new AVClient('http://localhost:3000/test/app');

    sandbox = sinon.createSandbox();
    sandbox.stub(Math, 'random').callsFake(deterministicMathRandom);
    sandbox.stub(sjcl.prng.prototype, 'randomWords').callsFake(deterministicRandomWords);
    resetDeterministicOffset();
  });

  afterEach(function() {
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
      nock('http://localhost:3000/').post('/test/app/get_randomizers')
        .replyWithFile(200, __dirname + '/replies/get_randomizers.valid.json');
    });

    it('returns success', async function() {
      const validCodes = ['aAjEuD64Fo2143'];
      const cvr = { '1': 'option1', '2': 'optiona' };

      await client.authenticateWithCodes(validCodes);
      await client.encryptBallot(cvr);
      const serverRandomizers = await client.startBenalohChallenge();
      expect(serverRandomizers).to.eql({
        '1': '12131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f3031',
        '2': '1415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f30313233'
      });
    });

  });

  context('remote errors', function() {
    beforeEach(async function() {
      nock('http://localhost:3000/').get('/test/app/config')
        .replyWithFile(200, __dirname + '/replies/config.valid.json');
      nock('http://localhost:3000/').post('/test/app/sign_in')
        .replyWithFile(200, __dirname + '/replies/sign_in.valid.json');
      nock('http://localhost:3000/').post('/test/app/challenge_empty_cryptograms')
          .replyWithFile(200, __dirname + '/replies/challenge_empty_cryptograms.valid.json');
      const validCodes = ['aAjEuD64Fo2143'];
      const cvr = { '1': 'option1', '2': 'optiona' };

      await client.authenticateWithCodes(validCodes);
      await client.encryptBallot(cvr);
    });

    it('returns an error message when there is a network error', async function() {
      nock('http://localhost:3000/').post('/test/app/get_randomizers').reply(404);
      return await client.startBenalohChallenge().then(
        () => expect.fail('Expected a rejected promise'),
        (error) => expect(error.message).to.equal('Request failed with status code 404')
      );
    });

    it('returns an error message when there is a server error', async function() {
      nock('http://localhost:3000/').post('/test/app/get_randomizers').reply(500, { nonsense: 'garbage' });
      return await client.startBenalohChallenge().then(
        () => expect.fail('Expected a rejected promise'),
        (error) => expect(error.message).to.equal('Request failed with status code 500')
      );
    });
  });

  context('submitting after spoiling', function() {
    let validCodes;
    let cvr;
    beforeEach(function() {
      nock('http://localhost:3000/').get('/test/app/config')
        .replyWithFile(200, __dirname + '/replies/config.valid.json');
      nock('http://localhost:3000/').post('/test/app/sign_in')
        .replyWithFile(200, __dirname + '/replies/sign_in.valid.json');
      nock('http://localhost:3000/').post('/test/app/challenge_empty_cryptograms')
        .replyWithFile(200, __dirname + '/replies/challenge_empty_cryptograms.valid.json');
      nock('http://localhost:3000/').post('/test/app/get_randomizers')
        .replyWithFile(200, __dirname + '/replies/get_randomizers.valid.json');

      validCodes = ['aAjEuD64Fo2143'];
      cvr = { '1': 'option1', '2': 'optiona' };
    });

    it('returns an error when getting latest board hash', async function() {
      nock('http://localhost:3000/').get('/test/app/get_latest_board_hash')
        .replyWithFile(200, __dirname + '/replies/avx_error.invalid_2.json');

      await client.authenticateWithCodes(validCodes);
      await client.encryptBallot(cvr);
      await client.startBenalohChallenge();

      const affidavit = 'fake affidavit data';

      return await client.submitEncryptedBallot(affidavit).then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => expect(error).to.equal('Could not get latest board hash')
      )
    });

    it('returns an error when submitting a vote')
    //  TODO: it should authenticate with codes
    //  TODO: it should encrypt contest selections
    //  TODO: it should get the latest board hash
    //  TODO: it should start the benaloh challenge
    //  TODO: it should sign and submit encrypted votes using the latest board hash that it got previously
  });
});
