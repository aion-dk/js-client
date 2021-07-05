const AVClient = require('../lib/av_client.js');
const chai = require('chai');
const expect = require('chai').expect;

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
    it('returns success', async function() {
      const validCodes = ['aAjEuD64Fo2143', '8beoTmFH13DCV3'];
      const result = await client.authenticateWithCodes(validCodes);
      expect(result).to.equal('Success');
    });
  });

  context('invalid election codes', function() {
    it('returns error', async function() {
      const invalidCodes = ['no', 'no'];
      return client.authenticateWithCodes(invalidCodes).then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => expect(error).to.equal('No ballots found for the submitted election codes')
      )
    });
  });
});
