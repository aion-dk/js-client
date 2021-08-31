import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import { deterministicRandomWords, deterministicMathRandom, resetDeterministicOffset } from './test_helpers';
import sinon = require('sinon');
const sjcl = require('../lib/av_client/sjcl')

describe('AVClient functions call order', () => {
  let client;

  beforeEach(() => {
    client = new AVClient('http://localhost:3000/test/app');
  });

  it('throws an error when validateAccessCode is called first', async () => {
    try {
      await client.validateAccessCode('1234');
      expect.fail('Expected an CallOutOfOrderError, got no error');
    } catch (e) {
      expect(e.name).to.eql('CallOutOfOrderError');
      expect(e.message).to.eql('#validateAccessCode requires exactly #requestAccessCode to be called before it');
    }
  });

  it('throws an error when constructBallotCryptograms is called first', async () => {
    try {
      await client.constructBallotCryptograms({ '1': 'option1', '2': 'optiona' });
      expect.fail('Expected an CallOutOfOrderError, got no error');
    } catch (e) {
      expect(e.name).to.eql('CallOutOfOrderError');
      expect(e.message).to.eql('#constructBallotCryptograms requires exactly #requestAccessCode, #validateAccessCode to be called before it');
    }
  });

  it('throws an error when spoilBallotCryptograms is called first', async () => {
    try {
      await client.spoilBallotCryptograms();
      expect.fail('Expected an CallOutOfOrderError, got no error');
    } catch (e) {
      expect(e.name).to.eql('CallOutOfOrderError');
      expect(e.message).to.eql('#spoilBallotCryptograms requires exactly #requestAccessCode, #validateAccessCode, #constructBallotCryptograms to be called before it');
    }
  });

  it('throws an error when submitBallotCryptograms is called first', async () => {
    try {
      await client.submitBallotCryptograms('affidavit bytes');
      expect.fail('Expected an CallOutOfOrderError, got no error');
    } catch (e) {
      expect(e.name).to.eql('CallOutOfOrderError');
      expect(e.message).to.eql('#submitBallotCryptograms requires exactly #requestAccessCode, #validateAccessCode, #constructBallotCryptograms to be called before it');
    }
  });

  context('submitBallotCryptograms is called directly after spoiling', () => {
    let sandbox;

    beforeEach(async () => {
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

      nock('http://localhost:3000/').post('/test/app/get_commitment_opening')
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

    it('throws an error when submitBallotCryptograms is called directly after spoiling', async () => {
      await client.requestAccessCode('voter123');
      await client.validateAccessCode('1234', 'voter@foo.bar');

      const cvr = { '1': 'option1', '2': 'optiona' };
      await client.constructBallotCryptograms(cvr);
      client.generateTestCode();
      await client.spoilBallotCryptograms();
      nock.cleanAll();

      try {
        await client.submitBallotCryptograms('affidavit bytes');
        expect.fail('Expected an CallOutOfOrderError, got no error');
      } catch (error) {
        expect(error.name).to.eql('CallOutOfOrderError');
        expect(error.message).to.eql('#submitBallotCryptograms requires exactly #requestAccessCode, #validateAccessCode, #constructBallotCryptograms to be called before it');
      }
    });
  });
});
