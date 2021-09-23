import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import { deterministicRandomWords, deterministicMathRandom, resetDeterministicOffset } from './test_helpers';
import sinon = require('sinon');
import { InvalidStateError } from '../lib/av_client/errors';
const sjcl = require('../lib/av_client/sjcl')


describe('AVClient functions call order', () => {
  let client: AVClient;

  beforeEach(() => {
    client = new AVClient('http://localhost:3000/test/app');
  });

  it('throws an error when validateAccessCode is called first', async () => {
    try {
      await client.validateAccessCode('1234');
      expect.fail('Expected an InvalidStateError, got no error');
    } catch (e) {
      expect(e.name).to.eql('InvalidStateError');
      expect(e.message).to.eql('Cannot validate access code. Access code was not requested.');
    }
  });

  it('throws an error when constructBallotCryptograms is called first', async () => {
    try {
      await client.constructBallotCryptograms({ '1': 'option1', '2': 'optiona' });
      expect.fail('Expected an InvalidStateError, got no error');
    } catch (e) {
      expect(e.name).to.eql('InvalidStateError');
      expect(e.message).to.eql('Cannot construct ballot cryptograms. Voter registration not completed successfully');
    }
  });

  // TODO: Skip test, spoilBallotCryptogram is not implemented yet
  it.skip('throws an error when spoilBallotCryptograms is prior to voter authentication', async () => {
    try {
      await client.spoilBallotCryptograms();
      expect.fail('Expected an InvalidStateError, got no error');
    } catch (e) {
      console.log(e)
      expect(e.name).to.eql('InvalidStateError');
      expect(e.message).to.eql('#spoilBallotCryptograms requires exactly #requestAccessCode, #validateAccessCode, #constructBallotCryptograms to be called before it');
    }
  });

  it('throws an error when submitBallotCryptograms is called first', async () => {
    try {
      await client.submitBallotCryptograms('affidavit bytes');
      expect.fail('Expected an InvalidStateError, got no error');
    } catch (e) {
      expect(e.name).to.eql('InvalidStateError');
      expect(e.message).to.eql('Cannot submit cryptograms. Voter identity unknown or no open envelopes');
    }
  });

  context('submitBallotCryptograms is called directly after spoiling', () => {
    let sandbox;

    beforeEach(async () => {
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

    // TODO: Skipped as it is not implemented yet
    it.skip('throws an error when submitBallotCryptograms is called after spoiling', async () => {
      await client.requestAccessCode('voter123', 'voter@foo.bar');
      await client.validateAccessCode('1234');
      await client.registerVoter()

      const cvr = { '1': 'option1', '2': 'optiona' };
      await client.constructBallotCryptograms(cvr);
      client.generateTestCode();
      await client.spoilBallotCryptograms();
      nock.cleanAll();

      try {
        await client.submitBallotCryptograms('affidavit bytes');
        expect.fail('Expected an InvalidStateError, got no error');
      } catch (error) {
        expect(error.name).to.eql('InvalidStateError');
        expect(error.message).to.eql('Cannot submit cryptograms after spoiling');
      }
    });

    it('throws an error if trying to register voter without validated OTP', async () => {
      try {
        await client.registerVoter();
        throw new Error('Should have thrown InvalidStateError');
      } catch(e) {
        expect(e).to.be.instanceOf(InvalidStateError)
      }
    });
  });
});
