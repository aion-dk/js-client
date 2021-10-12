import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import {
  deterministicRandomWords,
  deterministicMathRandom,
  expectError,
  resetDeterministicOffset,
  bulletinBoardHost,
  OTPProviderHost,
  voterAuthorizerHost
} from './test_helpers';
import sinon = require('sinon');
import { InvalidStateError } from '../lib/av_client/errors';
const sjcl = require('../lib/av_client/sjcl');

describe('AVClient functions call order', () => {
  let client: AVClient;

  beforeEach(() => {
    client = new AVClient('http://localhost:3000/test/app');
  });

  it('throws an error when validateAccessCode is called first', async () => {
    await expectError(
      client.validateAccessCode('1234'),
      InvalidStateError,
      'Cannot validate access code. Access code was not requested.'
    );
  });

  it('throws an error when constructBallotCryptograms is called first', async () => {
    await expectError(
      client.constructBallotCryptograms({ '1': 'option1', '2': 'optiona' }),
      InvalidStateError,
      'Cannot construct ballot cryptograms. Voter registration not completed successfully'
    );
  });

  it('throws an error when submitBallotCryptograms is called first', async () => {
    await expectError(
      client.submitBallotCryptograms('affidavit bytes'),
      InvalidStateError,
      'Cannot submit cryptograms. Voter identity unknown or no open envelopes'
    );
  });

  context('submitBallotCryptograms is called directly after spoiling', () => {
    let sandbox;

    beforeEach(async () => {
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

      nock(bulletinBoardHost).post('/test/app/get_commitment_opening')
        .replyWithFile(200, __dirname + '/replies/get_commitment_opening.valid.json');

      client = new AVClient('http://localhost:3000/test/app');
      await client.initialize()

      sandbox = sinon.createSandbox();
      sandbox.stub(Math, 'random').callsFake(deterministicMathRandom);
      sandbox.stub(sjcl.prng.prototype, 'randomWords').callsFake(deterministicRandomWords);
      resetDeterministicOffset();
    });

    afterEach(() => {
      sandbox.restore();
      nock.cleanAll();
    });

    it('throws an error if trying to register voter without validated OTP', async () => {
      await expectError(
        client.registerVoter(),
        InvalidStateError,
        'Cannot register voter without identity confirmation. User has not validated access code.'
      );
    });
  });
});
