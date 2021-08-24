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
    client = new AVClient('http://localhost:3000/test/app');

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
    beforeEach(() => {
      nock('http://localhost:3000/').get('/test/app/config')
        .replyWithFile(200, __dirname + '/replies/otp_flow/get_config.json');

      nock('http://localhost:1234/').post('/create_session')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_create_session.json');
      nock('http://localhost:1234/').post('/start_identification')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_start_identification.json');

      nock('http://localhost:1111/').post('/authorize')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_authorize.json');

      nock('http://localhost:3000/').post('/test/app/register')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_register.json');
      nock('http://localhost:3000/').post('/test/app/challenge_empty_cryptograms')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_challenge_empty_cryptograms.json');
      nock('http://localhost:3000/').get('/test/app/get_latest_board_hash')
        .replyWithFile(200, __dirname + '/replies/otp_flow/get_get_latest_board_hash.json');
    });

    context('all systems work', () => {
      it('returns server randomizers', async () => {
        nock('http://localhost:3000/').post('/test/app/get_randomizers')
          .replyWithFile(200, __dirname + '/replies/get_randomizers.valid.json');

        await client.requestAccessCode('some PII info');
        await client.validateAccessCode('1234', 'voter@foo.bar');

        const cvr = { '1': 'option1', '2': 'optiona' };
        await client.constructBallotCryptograms(cvr)

        const serverRandomizers = await client.spoilBallotCryptograms();
        expect(serverRandomizers).to.eql({
          '1': '12131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f3031',
          '2': '1415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f30313233'
        });
      });
    });

    context('remote errors', () => {
      it('returns an error message when there is a network error', async () => {
        nock('http://localhost:3000/').post('/test/app/get_randomizers')
          .reply(404);

        await client.requestAccessCode('some PII info');
        await client.validateAccessCode('1234', 'voter@foo.bar');

        const cvr = { '1': 'option1', '2': 'optiona' };
        await client.constructBallotCryptograms(cvr)

        return await client.spoilBallotCryptograms().then(
          () => expect.fail('Expected a rejected promise'),
          (error) => expect(error.message).to.equal('Request failed with status code 404')
        );
      });

      it('returns an error message when there is a server error', async () => {
        nock('http://localhost:3000/').post('/test/app/get_randomizers')
          .reply(500, { nonsense: 'garbage' });

        await client.requestAccessCode('some PII info');
        await client.validateAccessCode('1234', 'voter@foo.bar');

        const cvr = { '1': 'option1', '2': 'optiona' };
        await client.constructBallotCryptograms(cvr)

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

      nock('http://localhost:1111/').post('/authorize')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_authorize.json');

      nock('http://localhost:3000/').post('/test/app/register')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_register.json');
      nock('http://localhost:3000/').post('/test/app/challenge_empty_cryptograms')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_challenge_empty_cryptograms.json');
      nock('http://localhost:3000/').get('/test/app/get_latest_board_hash')
        .replyWithFile(200, __dirname + '/replies/otp_flow/get_get_latest_board_hash.json');

      nock('http://localhost:3000/').post('/test/app/get_randomizers')
        .replyWithFile(200, __dirname + '/replies/get_randomizers.valid.json');

      await client.requestAccessCode('some PII info');
      await client.validateAccessCode('1234', 'voter@foo.bar');

      const cvr = { '1': 'option1', '2': 'optiona' };
      await client.constructBallotCryptograms(cvr);

      const serverRandomizers = await client.spoilBallotCryptograms();

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
