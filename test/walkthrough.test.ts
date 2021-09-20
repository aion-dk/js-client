import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import { deterministicRandomWords, deterministicMathRandom, resetDeterministicOffset } from './test_helpers';
import sinon = require('sinon');
const sjcl = require('../lib/av_client/sjcl')
import { recordResponses } from './test_helpers'

const USE_MOCK = true

describe('entire voter flow using OTP authorization', () => {
  let sandbox;
  let expectedNetworkRequests : any[] = [];

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(Math, 'random').callsFake(deterministicMathRandom);
    sandbox.stub(sjcl.prng.prototype, 'randomWords').callsFake(deterministicRandomWords);
    resetDeterministicOffset();

    if(USE_MOCK) {
      expectedNetworkRequests.push(nock('http://localhost:3000/').get('/test/app/config')
        .replyWithFile(200, __dirname + '/replies/otp_flow/get_test_app_config.json'));
      expectedNetworkRequests.push(nock('http://localhost:1234/').post('/create_session')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_create_session.json'));
      expectedNetworkRequests.push(nock('http://localhost:1234/').post('/start_identification')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_start_identification.json'));
      expectedNetworkRequests.push(nock('http://localhost:1234/').post('/request_authorization')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_request_authorization.json'));
      expectedNetworkRequests.push(nock('http://localhost:1111/').post('/authorize')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_authorize.json'));
      expectedNetworkRequests.push(nock('http://localhost:3000/').post('/test/app/register')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_test_app_register.json'));
      expectedNetworkRequests.push(nock('http://localhost:3000/').post('/test/app/challenge_empty_cryptograms')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_test_app_challenge_empty_cryptograms.json'));
      expectedNetworkRequests.push(nock('http://localhost:3000/').get('/test/app/get_latest_board_hash')
        .replyWithFile(200, __dirname + '/replies/otp_flow/get_test_app_get_latest_board_hash.json'));
      expectedNetworkRequests.push(nock('http://localhost:3000/').post('/test/app/submit_votes')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_test_app_submit_votes.json'));
    }
  });

  afterEach(() => {
    sandbox.restore();
    if(USE_MOCK)
      nock.cleanAll();
  });

  it('returns a receipt', async () => {
    //return await recordResponses(async function() {
      const client = new AVClient('http://localhost:3000/test/app');
      await client.initialize()

      await client.requestAccessCode('voter123', 'voter@foo.bar').catch((e) => {
        console.error(e);
        expect.fail('AVClient#requestAccessCode failed.');
      });

      const confirmationToken = await client.validateAccessCode('1234').catch((e) => {
        console.error(e);
        expect.fail('AVClient#validateAccessCode failed');
      });

      await client.registerVoter().catch((e) => {
        console.error(e);
        expect.fail('AVClient#registerVoter failed');
      })

      const cvr = { '1': 'option1', '2': 'optiona' };
      const trackingCode = await client.constructBallotCryptograms(cvr).catch((e) => {
        console.error(e);
        expect.fail('AVClient#constructBallotCryptograms failed');
      });
      expect(trackingCode).to.eql('12918186c8a535b7c94576dca7b94ef2dbb9a728f63d466a4faf558a2e4be165');

      const affidavit = 'some bytes, most likely as binary PDF';
      const receipt = await client.submitBallotCryptograms(affidavit);

      expect(receipt).to.eql({
        previousBoardHash: '0de4ec18961c66cc75ddaeb4a55bdd01c2200eed787be5ea7e7ed0284e724a3b',
        boardHash: '4874559661833c93ac7c06610d5c111c698d3a2f850f35346ddc43b526fe373e',
        registeredAt: '2020-03-01T10:00:00.000+01:00',
        serverSignature: '11c1ba9b9738eea669dfb79358cd906ad341a466ebe02d5f39ea215585c18b27,bdafb61f0c2facedebc2aeba252bec2a7fe1e123f6affe3fc2fc87db650c5546',
        voteSubmissionId: 7
      });

      if(USE_MOCK)
        expectedNetworkRequests.forEach((mock) => mock.done());
    //});
  })
});
