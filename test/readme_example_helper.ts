import nock = require('nock');
import {
  resetDeterminism,
  bulletinBoardHost,
  OTPProviderHost,
  voterAuthorizerHost
} from './test_helpers';
let sandbox;

export function readmeTestSetup() {
  sandbox = resetDeterminism();

  nock(bulletinBoardHost).get('/mobile-api/us/config')
    .replyWithFile(200, __dirname + '/replies/otp_flow/get_us_app_config.json');
  nock(voterAuthorizerHost).post('/create_session')
    .replyWithFile(200, __dirname + '/replies/otp_flow/post_create_session.json');
  nock(voterAuthorizerHost).post('/request_authorization')
    .replyWithFile(200, __dirname + '/replies/otp_flow/post_request_authorization.json');
  nock(OTPProviderHost).post('/authorize')
    .replyWithFile(200, __dirname + '/replies/otp_flow/post_authorize.json');
  nock(bulletinBoardHost).post('/mobile-api/us/register')
    .replyWithFile(200, __dirname + '/replies/otp_flow/post_us_app_register.json');
  nock(bulletinBoardHost).post('/mobile-api/us/challenge_empty_cryptograms')
    .replyWithFile(200, __dirname + '/replies/otp_flow/post_us_app_challenge_empty_cryptograms.json');
  nock(bulletinBoardHost).get('/mobile-api/us/get_latest_board_hash')
    .replyWithFile(200, __dirname + '/replies/otp_flow/get_us_app_get_latest_board_hash.json');
  nock(bulletinBoardHost).post('/mobile-api/us/submit_votes')
    .replyWithFile(200, __dirname + '/replies/otp_flow/post_us_app_submit_votes.json');
}

export function readmeTestTeardown() {
  sandbox.restore();
  nock.cleanAll();
}
