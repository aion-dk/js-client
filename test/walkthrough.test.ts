import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import { deterministicRandomWords, deterministicMathRandom, resetDeterministicOffset } from './test_helpers';
import sinon = require('sinon');
const sjcl = require('../lib/av_client/sjcl')
const Crypto = require('../lib/av_client/aion_crypto.js')()


describe('entire voter flow using OTP authorization', function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.createSandbox();
    sandbox.stub(Math, 'random').callsFake(deterministicMathRandom);
    sandbox.stub(sjcl.prng.prototype, 'randomWords').callsFake(deterministicRandomWords);
    resetDeterministicOffset();

    nock('http://localhost:3000/').get('/test/app/config')
      .replyWithFile(200, __dirname + '/replies/otp_flow/get_config.json');

    nock('http://localhost:1234/').post('/initiate')
      .reply(200);
    nock('http://localhost:1111/').post('/authorize')
      .replyWithFile(200, __dirname + '/replies/otp_provider_authorize.valid.json');

    nock('http://localhost:3000/').post('/test/app/sign_in')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_sign_in.json');
    nock('http://localhost:3000/').post('/test/app/challenge_empty_cryptograms')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_challenge_empty_cryptograms.json');
    nock('http://localhost:3000/').get('/test/app/get_latest_board_hash')
      .replyWithFile(200, __dirname + '/replies/otp_flow/get_get_latest_board_hash.json');
    nock('http://localhost:3000/').post('/test/app/submit_votes')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_submit_votes.json');
  });

  afterEach(function() {
    sandbox.restore();
    nock.cleanAll();
  });

  it('returns a receipt', async function() {
    const client = new AVClient('http://localhost:3000/test/app');

    const authStatus = await client.requestAccessCode('some PII info');
    expect(authStatus).to.eql('Unauthorized');

    const authResult = await client.validateAccessCode('1234');
    expect(authResult).to.eql('Success');

    const fingerprint = await client.constructBallotCryptograms({
      '1': 'option1',
      '2': 'optiona'
    });
    expect(fingerprint).to.eql('da46ec752fd9197c0d77e6d843924b082b8b23350e8ac5fd454051dc1bf85ad2');

    const affidavit = 'some bytes, most likely as binary PDF';
    const receipt = await client.submitBallotCryptograms(affidavit);
    expect(receipt).to.eql({
      previousBoardHash: 'd8d9742271592d1b212bbd4cbbbe357aef8e00cdbdf312df95e9cf9a1a921465',
      boardHash: '87abbdea83326ba124a99f8f56ba4748f9df97022a869c297aad94c460804c03',
      registeredAt: '2020-03-01T10:00:00.000+01:00',
      serverSignature: 'bfaffbaf8778abce29ea98ebc90ca91e091881480e18ef31da815d181cead1f6,8977ad08d4fc3b1d9be311d93cf8e98178142685c5fbbf703abf2188a8d1c862',
      voteSubmissionId: 6
    });
  });
});
