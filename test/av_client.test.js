const AVClient = require('../lib/av_client.js');
const chai = require('chai');
const expect = require('chai').expect;
const nock = require('nock');
globalThis.TEST_MODE = true;

class StorageAdapter {
  constructor() {
    this.db = {}
  }

  get(key) {
    return this.db[key];
  }

  set(key, value) {
    this.db[key] = value;
  }
}

describe('AVClient#authenticateWithCodes', function() {
  let client;

  beforeEach(function() {
    const storage = new StorageAdapter();
    client = new AVClient(storage, 'http://localhost:3000/test/app');
  });

  context('valid election codes', function() {
    beforeEach(function() {
      nock('http://localhost:3000/').get('/test/app/config')
        .replyWithFile(200, __dirname + '/replies/config.valid.json');
      nock('http://localhost:3000/').post('/test/app/sign_in')
        .replyWithFile(200, __dirname + '/replies/sign_in.valid.json');
      nock('http://localhost:3000/').post('/test/app/challenge_empty_cryptograms')
        .replyWithFile(200, __dirname + '/replies/challenge_empty_cryptograms.valid.json');
    });

    it('returns success', async function() {
      const validCodes = ['aAjEuD64Fo2143', '8beoTmFH13DCV3'];
      const result = await client.authenticateWithCodes(validCodes);
      expect(result).to.equal('Success');
    });
  });

  context('invalid election codes', function() {
    beforeEach(function() {
      nock('http://localhost:3000/').get('/test/app/config')
        .replyWithFile(200, __dirname + '/replies/config.valid.json');
      nock('http://localhost:3000/').post('/test/app/sign_in')
        .replyWithFile(200, __dirname + '/replies/sign_in.invalid.json');
    });

    it('returns error', async function() {
      const invalidCodes = ['no', 'no'];
      return client.authenticateWithCodes(invalidCodes).then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => expect(error).to.equal('No ballots found for the submitted election codes')
      )
    });
  });
});
