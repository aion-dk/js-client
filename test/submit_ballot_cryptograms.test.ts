import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import { deterministicRandomWords, deterministicMathRandom, resetDeterministicOffset } from './test_helpers';
import sinon = require('sinon');
const sjcl = require('../lib/av_client/sjcl')
const Crypto = require('../lib/av_client/aion_crypto.js')()

describe('AVClient#submitBallotCryptograms', () => {
  let client: AVClient;
  let sandbox;
  let affidavit;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    sandbox.stub(Math, 'random').callsFake(deterministicMathRandom);
    sandbox.stub(sjcl.prng.prototype, 'randomWords').callsFake(deterministicRandomWords);
    resetDeterministicOffset();

    nock('http://localhost:3000/').get('/test/app/config')
      .replyWithFile(200, __dirname + '/replies/otp_flow/get_test_app_config.json');
    nock('http://localhost:1234/').post('/create_session')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_create_session.json');
    nock('http://localhost:1234/').post('/start_identification')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_start_identification.json');
    nock('http://localhost:1234/').post('/request_authorization')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_request_authorization.json');
    nock('http://localhost:1111/').post('/authorize')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_authorize.json');
    nock('http://localhost:3000/').post('/test/app/register')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_test_app_register.json');
    nock('http://localhost:3000/').post('/test/app/challenge_empty_cryptograms')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_test_app_challenge_empty_cryptograms.json');
    nock('http://localhost:3000/').get('/test/app/get_latest_board_hash')
      .replyWithFile(200, __dirname + '/replies/otp_flow/get_test_app_get_latest_board_hash.json');
    nock('http://localhost:3000/').post('/test/app/submit_votes')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_test_app_submit_votes.json');

    client = new AVClient('http://localhost:3000/test/app');
    await client.initialize()
  });

  afterEach( () => {
    sandbox.restore();
    nock.cleanAll();
  })

  context('given valid values', () => {
    it('successfully submits encrypted votes', async () => {
      await client.requestAccessCode('voter123', 'voter@foo.bar');
      await client.validateAccessCode('1234');
      await client.registerVoter();

      const cvr = { '1': 'option1', '2': 'optiona' };
      await client.constructBallotCryptograms(cvr)

      const affidavit = 'some bytes, most likely as binary PDF';
      const voteReceipt = await client.submitBallotCryptograms(affidavit);
      expect(voteReceipt).to.eql({
        previousBoardHash: '0de4ec18961c66cc75ddaeb4a55bdd01c2200eed787be5ea7e7ed0284e724a3b',
        boardHash: '4874559661833c93ac7c06610d5c111c698d3a2f850f35346ddc43b526fe373e',
        registeredAt: '2020-03-01T10:00:00.000+01:00',
        serverSignature: '11c1ba9b9738eea669dfb79358cd906ad341a466ebe02d5f39ea215585c18b27,bdafb61f0c2facedebc2aeba252bec2a7fe1e123f6affe3fc2fc87db650c5546',
        voteSubmissionId: 7
      });
    });
  });

  context('proof of correct encryption is corrupted', () => {
    it('fails with an error message', async () => {
      await client.requestAccessCode('voter123', 'voter@foo.bar');
      await client.validateAccessCode('1234');
      await client.registerVoter()

      const cvr = { '1': 'option1', '2': 'optiona' };
      await client.constructBallotCryptograms(cvr)

      // change the proof of ballot 1
      const randomness = 'corrupted_randomness!'
      client.voteEncryptions['1'].proof = Crypto.generateDiscreteLogarithmProof(randomness)

      const affidavit = 'some bytes, most likely as binary PDF';
      return await client.submitBallotCryptograms(affidavit).then(
        () => expect.fail('Expected exception to be thrown'),
        (error: Error) => expect(error.message).to.equal('Invalid vote receipt: corrupt server signature')
      );
    });
  });
});
