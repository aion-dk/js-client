import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import {
  bulletinBoardHost,
  deterministicRandomWords,
  deterministicMathRandom,
  expectError,
  resetDeterministicOffset
} from './test_helpers';
import sinon = require('sinon');
const sjcl = require('../lib/av_client/sjcl')

describe('AVClient#authenticateWithCodes', () => {
  let client: AVClient;
  let sandbox;

  beforeEach(async () => {
    client = new AVClient('http://localhost:3000/test/app');

    sandbox = sinon.createSandbox();
    sandbox.stub(Math, 'random').callsFake(deterministicMathRandom);
    sandbox.stub(sjcl.prng.prototype, 'randomWords').callsFake(deterministicRandomWords);
    resetDeterministicOffset();

    nock(bulletinBoardHost).get('/test/app/config')
      .replyWithFile(200, __dirname + '/replies/otp_flow/get_test_app_config.json');

    client = new AVClient('http://localhost:3000/test/app');
    await client.initialize()
  });

  afterEach(() => {
    sandbox.restore();
    nock.cleanAll();
  });

  context('given valid election codes', () => {
    it('resolves without errors', async () => {
      nock(bulletinBoardHost).post('/test/app/sign_in')
        .replyWithFile(200, __dirname + '/replies/sign_in.valid.json');
      nock(bulletinBoardHost).post('/test/app/challenge_empty_cryptograms')
        .replyWithFile(200, __dirname + '/replies/challenge_empty_cryptograms.valid.json');

      const validCodes = ['aAjEuD64Fo2143'];
      const result = await client.authenticateWithCodes(validCodes);
      expect(result).to.equal(undefined);
    });
  });

  context('given invalid election codes', () => {
    it('returns an error', async () => {
      nock(bulletinBoardHost).post('/test/app/sign_in')
        .replyWithFile(200, __dirname + '/replies/avx_error.invalid_3.json');

      const invalidCodes = ['no', 'no'];
      await expectError(
        client.authenticateWithCodes(invalidCodes),
        Error,
        'No ballots found for the submitted election codes'
      );
    });
  });
});
