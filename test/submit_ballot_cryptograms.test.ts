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
import * as Crypto from '../lib/av_client/aion_crypto';

const fs = require('fs')

describe('AVClient#submitBallotCryptograms', () => {
  let client: AVClient;
  let sandbox;

  beforeEach(async () => {
    sandbox = resetDeterminism();

    nock(bulletinBoardHost).get('/dbb/us/api/election_config')
      .replyWithFile(200, __dirname + '/replies/otp_flow/get_dbb_api_us_config.json');
    nock(voterAuthorizerHost).post('/create_session')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_create_session.json');
    nock(voterAuthorizerHost).post('/request_authorization')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_request_authorization.json');
    nock(OTPProviderHost).post('/authorize')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_authorize.json');
    nock(bulletinBoardHost).post('/dbb/us/api/registrations')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_dbb_api_us_register.json');

    // DEPRECATED
    // nock(bulletinBoardHost).post('/mobile-api/us/challenge_empty_cryptograms')
    //   .replyWithFile(200, __dirname + '/replies/otp_flow/post_us_app_challenge_empty_cryptograms.json');
    // nock(bulletinBoardHost).get('/mobile-api/us/get_latest_board_hash')
    //   .replyWithFile(200, __dirname + '/replies/otp_flow/get_us_app_get_latest_board_hash.json');
    // nock(bulletinBoardHost).post('/mobile-api/us/submit_votes')
    //   .replyWithFile(200, __dirname + '/replies/otp_flow/post_us_app_submit_votes.json');

    client = new AVClient('http://us-avx:3000/dbb/us/api');
    await client.initialize()
  });

  afterEach( () => {
    sandbox.restore();
    nock.cleanAll();
  })

  context('given valid values', () => {
    it.skip('successfully submits encrypted votes', async () => {
      await client.requestAccessCode('voter123', 'voter@foo.bar');
      await client.validateAccessCode('1234');
      await client.registerVoter();

      const cvr = {
        '50422d0f-e795-4324-8289-50e3d3459196': '1',
        'd866a7d7-15df-4765-9950-651c0ca1313d': '2'
      };

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

  // DEPRECATED DUE TO NEW BOARD STRUCTURE?
  context('proof of correct encryption is corrupted', () => {
    it.skip('fails with an error message', async () => {
      await client.requestAccessCode('voter123', 'voter@foo.bar');
      await client.validateAccessCode('1234');
      await client.registerVoter();

      const cvr = {
        '50422d0f-e795-4324-8289-50e3d3459196': '1',
        'd866a7d7-15df-4765-9950-651c0ca1313d': '2'
      };

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
