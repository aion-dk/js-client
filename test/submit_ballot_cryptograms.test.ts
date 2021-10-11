import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import {
  deterministicRandomWords,
  deterministicMathRandom,
  resetDeterministicOffset,
  bulletinBoardHost,
  OTPProviderHost,
  voterAuthorizerHost
} from './test_helpers';
import sinon = require('sinon');
const sjcl = require('../lib/av_client/sjcl')
const Crypto = require('../lib/av_client/aion_crypto.js')()
const fs = require('fs')

describe('AVClient#submitBallotCryptograms', () => {
  let client: AVClient;
  let sandbox;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    sandbox.stub(Math, 'random').callsFake(deterministicMathRandom);
    sandbox.stub(sjcl.prng.prototype, 'randomWords').callsFake(deterministicRandomWords);
    resetDeterministicOffset();

    nock(bulletinBoardHost).get('/test/app/config')
      .replyWithFile(200, __dirname + '/replies/otp_flow/get_test_app_config.json');
    nock(voterAuthorizerHost).post('/create_session')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_create_session.json');
    nock(voterAuthorizerHost).post('/request_authorization')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_request_authorization.json');
    nock(OTPProviderHost).post('/authorize')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_authorize.json');
    nock(bulletinBoardHost).post('/test/app/register')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_test_app_register.json');
    nock(bulletinBoardHost).post('/test/app/challenge_empty_cryptograms')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_test_app_challenge_empty_cryptograms.json');
    nock(bulletinBoardHost).get('/test/app/get_latest_board_hash')
      .replyWithFile(200, __dirname + '/replies/otp_flow/get_test_app_get_latest_board_hash.json');
    nock(bulletinBoardHost).post('/test/app/submit_votes')
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

      const affidavit = Buffer.from('some bytes, most likely as binary PDF').toString('base64');
      const receipt = await client.submitBallotCryptograms(affidavit);
      expect(receipt).to.have.keys(
        'boardHash',
        'previousBoardHash',
        'registeredAt',
        'serverSignature',
        'voteSubmissionId'
      )
      expect(receipt.previousBoardHash).to.eql('b8c006ae94b5f98d684317beaf4784938fc6cf2921d856cc3c8416ea4b510a30')
      expect(receipt.registeredAt).to.eql('2020-03-01T10:00:00.000+01:00')
      expect(receipt.voteSubmissionId).to.eql(7)
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
      const randomness = 'corrupted_randomness!';

      // TODO: Refactor to avoid manipulation of internal state
      (client as any ).voteEncryptions['1'].proof = Crypto.generateDiscreteLogarithmProof(randomness)

      const affidavit = Buffer.from('some bytes, most likely as binary PDF').toString('base64');
      return await client.submitBallotCryptograms(affidavit).then(
        () => expect.fail('Expected exception to be thrown'),
        (error: Error) => expect(error.message).to.equal('Invalid vote receipt: corrupt board hash')
      );
    });
  });
});
