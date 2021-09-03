import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import { deterministicRandomWords, deterministicMathRandom, resetDeterministicOffset } from './test_helpers';
import sinon = require('sinon');
const sjcl = require('../lib/av_client/sjcl')

describe('AVClient#spoilBallotCryptograms', () => {
  let client;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(Math, 'random').callsFake(deterministicMathRandom);
    sandbox.stub(sjcl.prng.prototype, 'randomWords').callsFake(deterministicRandomWords);
    resetDeterministicOffset();
  });

  afterEach(() => {
    sandbox.restore();
    nock.cleanAll();
  });

  context('given valid values', () => {
    beforeEach(async () => {
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

      client = new AVClient('http://localhost:3000/test/app');
      await client.initialize()
    });

    context('all systems work', () => {
      it('resolves without errors', async () => {
        nock('http://localhost:3000/').post('/test/app/get_commitment_opening')
          .replyWithFile(200, __dirname + '/replies/get_commitment_opening.valid.json');

        await client.requestAccessCode('voter123');
        await client.validateAccessCode('1234', 'voter@foo.bar');
        await client.registerVoter()

        const cvr = { '1': 'option1', '2': 'optiona' };
        await client.constructBallotCryptograms(cvr);
        client.generateTestCode();

        const result = await client.spoilBallotCryptograms();
        expect(result).to.equal(undefined);
      });
    });

    context('remote errors', () => {
      it('returns an error message when there is a network error', async () => {
        nock('http://localhost:3000/').post('/test/app/get_commitment_opening').reply(404);

        await client.requestAccessCode('voter123');
        await client.validateAccessCode('1234', 'voter@foo.bar');
        await client.registerVoter()

        const cvr = { '1': 'option1', '2': 'optiona' };
        await client.constructBallotCryptograms(cvr);
        client.generateTestCode();

        return await client.spoilBallotCryptograms().then(
          () => expect.fail('Expected a rejected promise'),
          (error) => expect(error.message).to.equal('Request failed with status code 404')
        );
      });

      it('returns an error message when there is a server error', async () => {
        nock('http://localhost:3000/').post('/test/app/get_commitment_opening').reply(500, { nonsense: 'garbage' });

        await client.requestAccessCode('voter123');
        await client.validateAccessCode('1234', 'voter@foo.bar');
        await client.registerVoter()

        const cvr = { '1': 'option1', '2': 'optiona' };
        await client.constructBallotCryptograms(cvr);
        client.generateTestCode();

        return await client.spoilBallotCryptograms().then(
          () => expect.fail('Expected a rejected promise'),
          (error) => expect(error.message).to.equal('Request failed with status code 500')
        );
      });
    });
  });

  context('submitting after spoiling', () => {
    it('returns an error when getting latest board hash', async () => {
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
      nock('http://localhost:3000/').post('/test/app/get_commitment_opening')
        .replyWithFile(200, __dirname + '/replies/get_commitment_opening.valid.json');
      nock('http://localhost:3000/').get('/test/app/get_latest_board_hash')
        .replyWithFile(200, __dirname + '/replies/otp_flow/get_get_latest_board_hash.json');

      client = new AVClient('http://localhost:3000/test/app');
      await client.initialize()

      await client.requestAccessCode('voter123');
      await client.validateAccessCode('1234', 'voter@foo.bar');
      await client.registerVoter()

      const cvr = { '1': 'option1', '2': 'optiona' };
      await client.constructBallotCryptograms(cvr);

      client.generateTestCode();
      await client.spoilBallotCryptograms();

      nock.cleanAll();
      nock('http://localhost:3000/').get('/test/app/get_latest_board_hash')
        .replyWithFile(403, __dirname + '/replies/avx_error.invalid_2.json');

      // Force AVClient to be unaware of spoilBallotCryptograms having been called.
      client.succeededMethods.pop();

      const affidavit = 'fake affidavit data';
      return await client.submitBallotCryptograms(affidavit).then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => {
          expect(error.message).to.eql('Request failed with status code 403')
        }
      )
    });
  });
});
