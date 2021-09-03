import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import { deterministicRandomWords, deterministicMathRandom, resetDeterministicOffset } from './test_helpers';
import sinon = require('sinon');
const sjcl = require('../lib/av_client/sjcl')

describe('AVClient#constructBallotCryptograms', () => {
  let client;
  let sandbox;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    sandbox.stub(Math, 'random').callsFake(deterministicMathRandom);
    sandbox.stub(sjcl.prng.prototype, 'randomWords').callsFake(deterministicRandomWords);
    resetDeterministicOffset();

    nock('http://localhost:3000/').get('/test/app/config')
      .replyWithFile(200, __dirname + '/replies/otp_flow/get_config.json');
    nock('http://localhost:1234/').post('/create_session')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_create_session.json');
    nock('http://localhost:1234/').post('/start_identification')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_start_identification.json');
    nock('http://localhost:1234/').post('/request_authorization')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_request_authorization.json');

    nock('http://localhost:1111/').post('/authorize')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_authorize.json');

    nock('http://localhost:3000/').post('/test/app/register')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_register.json');
    nock('http://localhost:3000/').post('/test/app/challenge_empty_cryptograms')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_challenge_empty_cryptograms.json');
    nock('http://localhost:3000/').get('/test/app/get_latest_board_hash')
      .replyWithFile(200, __dirname + '/replies/otp_flow/get_get_latest_board_hash.json');

    client = new AVClient('http://localhost:3000/test/app');
    await client.initialize()
  });

  afterEach(() => {
    sandbox.restore();
    nock.cleanAll();
  })

  context('given previous steps succeeded, and it receives valid values', () => {
    it('encrypts correctly', async () => {
      await client.requestAccessCode('voter123');
      await client.validateAccessCode('1234', 'voter@foo.bar');
      await client.registerVoter()

      const cvr = { '1': 'option1', '2': 'optiona' };

      const trackingCode = await client.constructBallotCryptograms(cvr);

      expect(trackingCode).to.equal('da46ec752fd9197c0d77e6d843924b082b8b23350e8ac5fd454051dc1bf85ad2');
    });
  });

  context('given invalid CVR', () => {
    it('encryption fails when voting on invalid contest', async () => {
      await client.requestAccessCode('voter123');
      await client.validateAccessCode('1234', 'voter@foo.bar');
      await client.registerVoter()

      const cvr = { '1': 'option1', '3': 'optiona' };

      try {
        await client.constructBallotCryptograms(cvr);
        expect.fail('Expected an error to be thrown');
      } catch(error) {
        expect(error.message).to.equal('Corrupt CVR: Contains invalid contest');
      }
    });

    it('encryption fails when voting on invalid option', async () => {
      await client.requestAccessCode('voter123');
      await client.validateAccessCode('1234', 'voter@foo.bar');
      await client.registerVoter()

      const cvr = { '1': 'option1', '2': 'wrong_option' };

      try {
        await client.constructBallotCryptograms(cvr);
        expect.fail('Expected error to be thrown');
      } catch(error) {
        expect(error.message).to.equal('Corrupt CVR: Contains invalid option');
      }
    });
  });
});
