import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import { deterministicRandomWords, deterministicMathRandom, resetDeterministicOffset } from './av_client_test_helpers';
import sinon = require('sinon');
const sjcl = require('../lib/av_client/sjcl')
const Crypto = require('../lib/av_client/aion_crypto.js')()

describe('AVClient#voteSubmission', function() {
  let client;
  let sandbox;

  beforeEach(function() {
    client = new AVClient('http://localhost:3000/test/app');

    sandbox = sinon.createSandbox();
    sandbox.stub(Math, 'random').callsFake(deterministicMathRandom);
    sandbox.stub(sjcl.prng.prototype, 'randomWords').callsFake(deterministicRandomWords);
    resetDeterministicOffset();
  });

  afterEach( function() {
    sandbox.restore();
    nock.cleanAll();
  })

  context('given valid values', function() {
    beforeEach(function() {
      nock('http://localhost:3000/').get('/test/app/config')
        .replyWithFile(200, __dirname + '/replies/config.valid.json');
      nock('http://localhost:3000/').post('/test/app/sign_in')
        .replyWithFile(200, __dirname + '/replies/sign_in.valid.json');
      nock('http://localhost:3000/').post('/test/app/challenge_empty_cryptograms')
        .replyWithFile(200, __dirname + '/replies/challenge_empty_cryptograms.valid.json');
      nock('http://localhost:3000/').get('/test/app/get_latest_board_hash')
        .replyWithFile(200, __dirname + '/replies/get_latest_board_hash.valid.json');
      nock('http://localhost:3000/').post('/test/app/submit_votes')
        .replyWithFile(200, __dirname + '/replies/submit_votes.valid.json');
    });

    it('successfully submits encrypted votes', async function() {
      const validCodes = ['aAjEuD64Fo2143'];
      const contestSelections = { '1': 'option1', '2': 'optiona' };

      await client.authenticateWithCodes(validCodes);
      client.encryptContestSelections(contestSelections);
      const voteReceipt = await client.signAndSubmitEncryptedVotes();
      expect(voteReceipt.registeredAt).to.equal('2020-03-01T10:00:00.000+01:00');
      expect(voteReceipt).to.eql({
        previousBoardHash: 'd8d9742271592d1b212bbd4cbbbe357aef8e00cdbdf312df95e9cf9a1a921465',
        boardHash: '5a9175c2b3617298d78be7d0244a68f34bc8b2a37061bb4d3fdf97edc1424098',
        registeredAt: '2020-03-01T10:00:00.000+01:00',
        serverSignature: 'dbcce518142b8740a5c911f727f3c02829211a8ddfccabeb89297877e4198bc1,46826ddfccaac9ca105e39c8a2d015098479624c411b4783ca1a3600daf4e8fa',
        voteSubmissionId: 6
      });
    });
  });

  context('given invalid values', function() {
    let validCodes;
    let contestSelections;

    beforeEach(function() {
      nock('http://localhost:3000/').get('/test/app/config')
        .replyWithFile(200, __dirname + '/replies/config.valid.json');
      nock('http://localhost:3000/').post('/test/app/sign_in')
        .replyWithFile(200, __dirname + '/replies/sign_in.valid.json');
      nock('http://localhost:3000/').post('/test/app/challenge_empty_cryptograms')
        .replyWithFile(200, __dirname + '/replies/challenge_empty_cryptograms.valid.json');
      nock('http://localhost:3000/').get('/test/app/get_latest_board_hash')
        .replyWithFile(200, __dirname + '/replies/get_latest_board_hash.valid.json');

      validCodes = ['aAjEuD64Fo2143'];
      contestSelections = { '1': 'option1', '2': 'optiona' };
    });

    it('fails when not voting on all contests', async function() {
      nock('http://localhost:3000/').post('/test/app/submit_votes')
        .replyWithFile(200, __dirname + '/replies/avx_error.invalid_4.json');

      await client.authenticateWithCodes(validCodes);
      client.encryptContestSelections(contestSelections);

      // vote only on ballot 1
      delete client.voteEncryptions['2']

      return await client.signAndSubmitEncryptedVotes().then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => expect(error).to.equal('Ballot ids do not correspond.')
      )
    });

    it.skip('fails when digital signature is corrupt', async function() {
      nock('http://localhost:3000/').post('/test/app/submit_votes')
        .replyWithFile(200, __dirname + '/replies/avx_error.invalid_5.json');

      await client.authenticateWithCodes(validCodes);
      client.encryptContestSelections(contestSelections);

      // change voter's key pair
      const keyPair = Crypto.generateKeyPair();
      client.keyPair = {
        privateKey: keyPair.private_key,
        publicKey: keyPair.public_key
      }

      return await client.signAndSubmitEncryptedVotes().then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => expect(error).to.equal('Digital signature did not validate.')
      )
    });

    it('fails when content is corrupt', async function() {
      nock('http://localhost:3000/').post('/test/app/submit_votes')
        .replyWithFile(200, __dirname + '/replies/avx_error.invalid_6.json');

      await client.authenticateWithCodes(validCodes);
      client.encryptContestSelections(contestSelections);

      // change the voter identifier
      client.voterIdentifier = 'corrupt identifier';

      return await client.signAndSubmitEncryptedVotes().then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => expect(error).to.equal('Content hash does not correspond.')
      )
    });

    it('fails when proof of correct encryption is corrupt', async function() {
      nock('http://localhost:3000/').post('/test/app/submit_votes')
        .replyWithFile(200, __dirname + '/replies/avx_error.invalid_7.json');

      await client.authenticateWithCodes(validCodes);
      client.encryptContestSelections(contestSelections);

      // change the proof of ballot 1
      const randomness = client.voteEncryptions['1'].randomness
      const newRandomness = Crypto.addBigNums(randomness, randomness)
      client.voteEncryptions['1'].proof = Crypto.generateDiscreteLogarithmProof(newRandomness)

      return await client.signAndSubmitEncryptedVotes().then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => expect(error).to.equal('Proof of correct encryption failed for ballot #1.')
      )
    });
  });
});
