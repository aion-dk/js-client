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
});
