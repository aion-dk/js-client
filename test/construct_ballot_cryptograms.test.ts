import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import { deterministicRandomWords, deterministicMathRandom, resetDeterministicOffset } from './test_helpers';
import sinon = require('sinon');
import { ElectionConfig } from '../lib/av_client/election_config';
import { Option } from '../lib/av_client/types';
const sjcl = require('../lib/av_client/sjcl')

describe('AVClient#constructBallotCryptograms', () => {
  let client: AVClient;
  let sandbox;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    sandbox.stub(Math, 'random').callsFake(deterministicMathRandom);
    sandbox.stub(sjcl.prng.prototype, 'randomWords').callsFake(deterministicRandomWords);
    resetDeterministicOffset();

    nock('http://localhost:3000/').get('/test/app/config')
      .replyWithFile(200, __dirname + '/replies/otp_flow/get_test_app_config.json');
    nock('http://localhost:1234/').post('/create_session')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_create_session.json');
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

    client = new AVClient('http://localhost:3000/test/app');
    await client.initialize()
  });

  afterEach(() => {
    sandbox.restore();
    nock.cleanAll();
  })

  context('given previous steps succeeded, and it receives valid values', () => {
    it('encrypts correctly', async () => {
      await client.requestAccessCode('voter123', 'voter@foo.bar');
      await client.validateAccessCode('1234');
      await client.registerVoter()

      const cvr = { '1': 'option1', '2': 'optiona' };

      const trackingCode = await client.constructBallotCryptograms(cvr);

      expect(trackingCode.length).to.eql(64);
    });
  });

  const createOptions = (optionHandles: string[]): Option[] => {
    return optionHandles.map((handle, i) => {
      return {
        "id": i,
        "handle": handle,
        "title": {},
        "subtitle": {},
        "description": {},
        "url": {},
        "video_url": {},
        "image": null,
        "ancestry": null,
        "selectable": true
      }
    })
  }


  context('given invalid CVR', () => {
    it('encryption fails when voting on invalid contest / encryption fails when voting on invalid option', async () => {
      const template = { title: {}, vote_encoding_type: 0, description: {}, write_in: false }

      const contest1 = { ...template, id: 1, options: createOptions(['option1', 'option2']) };
      const contest2 = { ...template, id: 2, options: createOptions(['optionA', 'optionB']) };
      const contest3 = { ...template, id: 3, options: createOptions(['optionX', 'optionY']) };

      const ballot1 = [contest1, contest2];
      const ballot2 = [contest1, contest3];

      const cvr1 = { '1': 'option1', '3': 'optionX' };
      const cvr2 = { '1': 'option1', '3': 'optionINVALID' };

      expect(client.validateCvr(cvr2, ballot2)).to.be.equal(':invalid_option')
      expect(client.validateCvr(cvr2, ballot1)).to.be.equal(':invalid_contest')
      expect(client.validateCvr(cvr1, ballot2)).to.be.equal(':okay')
    });
  });
});
