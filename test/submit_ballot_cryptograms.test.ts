import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import {
  expectError,
  resetDeterminism,
  bulletinBoardHost,
  OTPProviderHost,
  voterAuthorizerHost
} from './test_helpers';
const Crypto = require('../lib/av_client/aion_crypto.js')()
const fs = require('fs')

describe('AVClient#submitBallotCryptograms', () => {
  let client: AVClient;
  let sandbox;

  beforeEach(async () => {
    sandbox = resetDeterminism();

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
      );
      expect(receipt.previousBoardHash.length).to.eql(64);
    });
  });

  context('proof of correct encryption is corrupted', () => {
    it('fails with an error message', async () => {
      await client.requestAccessCode('voter123', 'voter@foo.bar');
      await client.validateAccessCode('1234');
      await client.registerVoter();

      const cvr = { '1': 'option1', '2': 'optiona' };
      await client.constructBallotCryptograms(cvr);

      // change the proof of ballot 1
      const randomness = 'corrupted_randomness!';

      // TODO: Refactor to avoid manipulation of internal state
      (client as any ).voteEncryptions['1'].proof = Crypto.generateDiscreteLogarithmProof(randomness);

      const affidavit = Buffer.from('some bytes, most likely as binary PDF').toString('base64');
      await expectError(
        client.submitBallotCryptograms(affidavit),
        Error,
        'Invalid vote receipt: corrupt board hash'
      );
    });
  });
});
