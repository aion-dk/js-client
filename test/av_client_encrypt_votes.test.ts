import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import { deterministicRandomWords, deterministicMathRandom } from './av_client_test_helpers';
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
        '1': '03774735c7f471d548151bfef183f37e8b58fb06ed311b0fda8d33dddf3a9c98cf,03c5316bf5f97097e1806d89a689048cdf324984683b6ad7f90a07cabdc4189d32',
        '2': '03204cd76c47a8cca92342a438404808ec9f4ea83fb3713e889c79483c1a377023,0383166e9482a1a782f85f4b36a2ecec27ca64b629024e9cdf3ace339683974584'
        // '1': '038a06ff160e6b0ce13997e69f8b09382715b4e85238518bb0bcf59b4361991716,03ee16b3a21cd89479ddbb3a8752068556dec9d2762327c3872d114ea2bb04c15d',
        // '2': '02056dd2caee72c152c579a996f5e0735ab211f89add84fb184eace5db4634f5d7,03fafa3a48a8bfc5ce3a04d21ab68b38660d0926bd55e43c89466a799d7340c08b'
      };

      await client.authenticateWithCodes(validCodes);
      const encryptResponse = client.encryptContestSelections(contestSelections);
      const cryptograms = client.cryptogramsForConfirmation();

      expect(encryptResponse).to.equal('Success');
      expect(cryptograms).to.deep.equal(contestCryptograms);
    });
  });
});
