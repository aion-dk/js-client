const AVClient = require('../lib/av_client.js');
const chai = require('chai');
const expect = require('chai').expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

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
    client = new AVClient(storage);
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
      try {
        const result = await client.authenticateWithCodes(invalidCodes);
      } catch(error) {
        console.log("This never gets run")
        expect(error).to.equal('THIS NEVER GETS ASSERTED');
      }
    });
  });
});
