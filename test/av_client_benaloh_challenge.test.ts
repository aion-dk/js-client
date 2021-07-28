import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import { deterministicRandomWords, deterministicMathRandom } from "./av_client_test_helpers";
import sinon = require('sinon');
const sjcl = require('../lib/av_client/sjcl')

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

describe('AVClient#benalohChallenge', function() {
  let client;
  let sandbox;

  beforeEach(function() {
    const storage = new StorageAdapter();
    client = new AVClient(storage, 'http://localhost:3000/test/app');

    sandbox = sinon.createSandbox();
    sandbox.stub(Math, 'random').callsFake(deterministicMathRandom);
    sandbox.stub(sjcl.prng.prototype, 'randomWords').callsFake(deterministicRandomWords);
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
      nock('http://localhost:3000/').post('/test/app/get_randomizers')
        .replyWithFile(200, __dirname + '/replies/get_randomizers.valid.json');
    });

    it('returns success', async function() {
      const validCodes = ['aAjEuD64Fo2143', '8beoTmFH13DCV3'];
      const contestSelections = { '1': 'option1', '2': 'optiona' };

      await client.authenticateWithCodes(validCodes);
      client.encryptContestSelections(contestSelections);
      const result = await client.startBenalohChallenge();
      expect(result).to.equal('Success');
    });

  });

  context('remote errors', function() {
    beforeEach(async function() {
      nock('http://localhost:3000/').get('/test/app/config')
        .replyWithFile(200, __dirname + '/replies/config.valid.json');
      nock('http://localhost:3000/').post('/test/app/sign_in')
        .replyWithFile(200, __dirname + '/replies/sign_in.valid.json');
      nock('http://localhost:3000/').post('/test/app/challenge_empty_cryptograms')
          .replyWithFile(200, __dirname + '/replies/challenge_empty_cryptograms.valid.json');
      const validCodes = ['aAjEuD64Fo2143', '8beoTmFH13DCV3'];
      const contestSelections = { '1': 'option1', '2': 'optiona' };

      await client.authenticateWithCodes(validCodes);
      client.encryptContestSelections(contestSelections);
    });

    it('returns an error message when there is a network error', async function() {
      nock('http://localhost:3000/').post('/test/app/get_randomizers').reply(404);
      return await client.startBenalohChallenge().then(
        () => expect.fail('Expected a rejected promise'),
        (error) => expect(error.message).to.equal('Request failed with status code 404')
      );
    });

    it('returns an error message when there is a server error', async function() {
      nock('http://localhost:3000/').post('/test/app/get_randomizers').reply(500, { nonsense: 'garbage' });
      return await client.startBenalohChallenge().then(
        () => expect.fail('Expected a rejected promise'),
        (error) => expect(error.message).to.equal('Request failed with status code 500')
      );
    });
  });

  context('submitting after spoiling', function() {
    let validCodes;
    let contestSelections;
    beforeEach(function() {
      nock('http://localhost:3000/').get('/test/app/config')
        .replyWithFile(200, __dirname + '/replies/config.valid.json');
      nock('http://localhost:3000/').post('/test/app/sign_in')
        .replyWithFile(200, __dirname + '/replies/sign_in.valid.json');
      nock('http://localhost:3000/').post('/test/app/challenge_empty_cryptograms')
        .replyWithFile(200, __dirname + '/replies/challenge_empty_cryptograms.valid.json');
      nock('http://localhost:3000/').post('/test/app/get_randomizers')
        .replyWithFile(200, __dirname + '/replies/get_randomizers.valid.json');

      validCodes = ['aAjEuD64Fo2143', '8beoTmFH13DCV3'];
      contestSelections = { '1': 'option1', '2': 'optiona' };
    });

    it('returns an error when getting latest board hash', async function() {
      nock('http://localhost:3000/').get('/test/app/get_latest_board_hash')
        .replyWithFile(200, __dirname + '/replies/avx_error.invalid_2.json');

      await client.authenticateWithCodes(validCodes);
      client.encryptContestSelections(contestSelections);
      await client.startBenalohChallenge();

      return await client.signAndSubmitEncryptedVotes().then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => expect(error).to.equal('Could not get latest board hash')
      )
    });

    it('returns an error when submitting a vote')
    //  TODO: it should authenticate with codes
    //  TODO: it should encrypt contest selections
    //  TODO: it should get the latest board hash
    //  TODO: it should start the benaloh challenge
    //  TODO: it should sign and submit encrypted votes using the latest board hash that it got previously
  });
});
