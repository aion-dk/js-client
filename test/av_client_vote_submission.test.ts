import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import {deterministicMathRandom, deterministicRandomWords} from './av_client_test_helpers';
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
  });

  afterEach( function() {
    sandbox.restore();
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
      const validCodes = ['aAjEuD64Fo2143', '8beoTmFH13DCV3'];
      const contestSelections = { '1': 'option1', '2': 'optiona' };

      await client.authenticateWithCodes(validCodes);
      client.encryptContestSelections(contestSelections);
      const voteReceipt = await client.signAndSubmitEncryptedVotes();
      expect(voteReceipt).to.eql({
        previousBoardHash: 'bac9d02bec373129ebd62cea013fa7ba2b7820006398f0fb1f652d88bf238c6f',
        boardHash: 'b275396c9acdbf828e544f0d25bb0acd1a164934a0b693ad74791edce1b7e331',
        registeredAt: '2021-07-22T14:11:08.064+02:00',
        serverSignature: '64f5d7036505a0c5b4194092216e4671e7f8892b76ed426d8844f89ab3cb81b4,d336147a047773f6ee10311dbf6f5cd27a8b12bd59d598be9859fecd549c1084',
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

      validCodes = ['aAjEuD64Fo2143', '8beoTmFH13DCV3'];
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
