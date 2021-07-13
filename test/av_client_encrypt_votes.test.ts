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

describe('AVClient#encryptVotes', function() {
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

  context('encrypt vote', function() {
    beforeEach(function() {
      nock('http://localhost:3000/').get('/test/app/config')
        .replyWithFile(200, __dirname + '/replies/config.valid.json');
      nock('http://localhost:3000/').post('/test/app/sign_in')
        .replyWithFile(200, __dirname + '/replies/sign_in.valid.json');
      nock('http://localhost:3000/').post('/test/app/challenge_empty_cryptograms')
          .replyWithFile(200, __dirname + '/replies/challenge_empty_cryptograms.valid.json');
    });

    it('encrypts correctly', async function() {
      const validCodes = ['aAjEuD64Fo2143', '8beoTmFH13DCV3'];
      const contestSelections = { '1': 'option1', '2': 'optiona' };
      const contestCryptograms = {
        '1': '0244df49fde4a25cb25ccb03e5611b5f6301bf0eb804c8df5867cdc73f2ccc2ae3,029abf8fca845b2a6b57627e63adaf7f46d608ecb27393e5d68e37a17f38a646ad',
        '2': '028168ab1e56f7cf8f7c652d7abeb3a8e1ede11f40d0faaee16d2e336328c813cf,02d85bfbb32b8140a99294c17adc719e42d960994b4fab70351fd8b6dc050b9676'
      };

      await client.authenticateWithCodes(validCodes);
      const encryptResponse = client.encryptContestSelections(contestSelections);
      const cryptograms = client.cryptogramsForConfirmation();

      expect(encryptResponse).to.equal('Success');
      expect(cryptograms).to.deep.equal(contestCryptograms);
    });
  });
});
