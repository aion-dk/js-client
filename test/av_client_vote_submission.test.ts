import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import {deterministicMathRandom, deterministicRandomWords} from "./av_client_test_helpers";
import sinon = require('sinon');
const sjcl = require('../lib/av_client/sjcl')
const Crypto = require('../lib/av_client/aion_crypto.js')()

class StorageAdapter {
  private db: object;

  constructor() {
    this.db = {}
  }

  get(key: string) {
    return this.db[key];
  }

  set(key: string, value: any) {
    this.db[key] = value;
  }
}

describe('AVClient#voteSubmission', function() {
  let client;
  let sandbox;
  let storage;

  beforeEach(function() {
    storage = new StorageAdapter();
    client = new AVClient(storage, 'http://localhost:3000/test/app');

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
      const result = await client.signAndSubmitEncryptedVotes();
      expect(result).to.equal('Success');
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
      const voteEncryptions = storage.get('voteEncryptions')
      delete voteEncryptions['2']
      storage.set('voteEncryptions', voteEncryptions)

      return await client.signAndSubmitEncryptedVotes().then(
          () => expect.fail('Expected promise to be rejected'),
          (error) => expect(error).to.equal('Ballot ids do not correspond.')
      )
    });

    it('fails when digital signature is corrupt', async function() {
      nock('http://localhost:3000/').post('/test/app/submit_votes')
          .replyWithFile(200, __dirname + '/replies/avx_error.invalid_5.json');

      await client.authenticateWithCodes(validCodes);
      client.encryptContestSelections(contestSelections);

      // change voter's key pair
      const keyPair = Crypto.generateKeyPair();
      storage.set('keyPair', {
        privateKey: keyPair['private_key'],
        publicKey: keyPair['public_key']
      })

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
      storage.set('voterIdentifier', 'corrupt identifier');

      return await client.signAndSubmitEncryptedVotes().then(
          () => expect.fail('Expected promise to be rejected'),
          (error) => expect(error).to.equal('Content hash does not correspond.')
      )
    });

  });
});
