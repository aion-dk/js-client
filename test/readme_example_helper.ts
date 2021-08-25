import nock = require('nock');
import { deterministicRandomWords, deterministicMathRandom, resetDeterministicOffset } from './test_helpers';
import sinon = require('sinon');
const sjcl = require('../lib/av_client/sjcl')
const Crypto = require('../lib/av_client/aion_crypto.js')()

let sandbox;

export function readmeTestSetup() {
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
}

export function readmeTestTeardown() {
  sandbox.restore();
  nock.cleanAll();
}
