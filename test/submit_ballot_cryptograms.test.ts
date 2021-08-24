import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import { deterministicRandomWords, deterministicMathRandom, resetDeterministicOffset } from './test_helpers';
import sinon = require('sinon');
const sjcl = require('../lib/av_client/sjcl')
const Crypto = require('../lib/av_client/aion_crypto.js')()

describe('AVClient#submitBallotCryptograms', () => {
  let client;
  let sandbox;
  let affidavit;

  beforeEach(() => {
    client = new AVClient('http://localhost:3000/test/app');

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

    nock('http://localhost:1111/').post('/authorize')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_authorize.json');

    nock('http://localhost:3000/').post('/test/app/register')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_register.json');
    nock('http://localhost:3000/').post('/test/app/challenge_empty_cryptograms')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_challenge_empty_cryptograms.json');
    nock('http://localhost:3000/').get('/test/app/get_latest_board_hash')
      .replyWithFile(200, __dirname + '/replies/otp_flow/get_get_latest_board_hash.json');
    nock('http://localhost:3000/').post('/test/app/submit_votes')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_submit_votes.json');
  });

  afterEach( () => {
    sandbox.restore();
    nock.cleanAll();
  })

  context('given valid values', () => {
    it('successfully submits encrypted votes', async () => {
      await client.requestAccessCode('some PII info');
      await client.validateAccessCode('1234', 'voter@foo.bar');

      const cvr = { '1': 'option1', '2': 'optiona' };
      await client.constructBallotCryptograms(cvr)

      const affidavit = 'some bytes, most likely as binary PDF';
      const voteReceipt = await client.submitBallotCryptograms(affidavit);
      expect(voteReceipt).to.eql({
        previousBoardHash: 'd8d9742271592d1b212bbd4cbbbe357aef8e00cdbdf312df95e9cf9a1a921465',
        boardHash: '87abbdea83326ba124a99f8f56ba4748f9df97022a869c297aad94c460804c03',
        registeredAt: '2020-03-01T10:00:00.000+01:00',
        serverSignature: 'bfaffbaf8778abce29ea98ebc90ca91e091881480e18ef31da815d181cead1f6,8977ad08d4fc3b1d9be311d93cf8e98178142685c5fbbf703abf2188a8d1c862',
        voteSubmissionId: 6
      });
    });
  });

  context('voter identifier is corrupted', () => {
    it('fails with an error message', async () => {
      await client.requestAccessCode('some PII info');
      await client.validateAccessCode('1234', 'voter@foo.bar');

      const cvr = { '1': 'option1', '2': 'optiona' };
      await client.constructBallotCryptograms(cvr)

      // change the voter identifier
      client.voterIdentifier = 'corrupt identifier';

      const affidavit = 'some bytes, most likely as binary PDF';
      return await client.submitBallotCryptograms(affidavit).then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => expect(error).to.equal('Invalid vote receipt: corrupt board hash')
      );
    });
  });

  context('proof of correct encryption is corrupted', () => {
    it('fails with an error message', async () => {
      await client.requestAccessCode('some PII info');
      await client.validateAccessCode('1234', 'voter@foo.bar');

      const cvr = { '1': 'option1', '2': 'optiona' };
      await client.constructBallotCryptograms(cvr)

      // change the proof of ballot 1
      const randomness = client.voteEncryptions['1'].randomness
      const newRandomness = Crypto.addBigNums(randomness, randomness)
      client.voteEncryptions['1'].proof = Crypto.generateDiscreteLogarithmProof(newRandomness)

      const affidavit = 'some bytes, most likely as binary PDF';
      return await client.submitBallotCryptograms(affidavit).then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => expect(error).to.equal('Invalid vote receipt: corrupt server signature')
      );
    });
  });
});
