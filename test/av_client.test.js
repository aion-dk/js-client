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

  // Seems fine
  context('ASYNC valid election codes', function() {
    it('returns success', async function() {
      const validCode = 'abc';
      const result = await client.authenticateWithCodes(validCode);
      expect(result).to.equal('Success');
    });
  });

  // Seems fine
  context('CHAI_AS_PROMISED valid election codes', function() {
    it('returns success', function() {
      const validCode = 'abc';
      expect(
        client.authenticateWithCodes(validCode)
      ).to.eventually.equal('Success');
    });
  });

  // Seems fine
  context('ASYNC valid election codes, bad expectation', function() {
    it('returns success', async function() {
      const validCode = 'abc';
      const result = await client.authenticateWithCodes(validCode);
      expect(result).to.equal('Unexpected success');
    });
  });

  // Seems fine
  context('CHAI_AS_PROMISED valid election codes', function() {
    it('returns success', function() {
      const validCode = 'abc';
      expect(
        client.authenticateWithCodes(validCode)
      ).to.eventually.equal('Unexpected success');
    });
  });

  // Seems fine
  context('ASYNC invalid election codes', function() {
    it('returns error', async function() {
      const invalidCode = 'nonsense';
      try {
        const result = await client.authenticateWithCodes(invalidCode);
      } catch(error) {
        expect(error).to.equal('Failure');
      }
    });
  });

  // Seems fine
  context('CHAI_AS_PROMISED invalid election codes', function() {
    it('returns error', function() {
      const invalidCode = 'nonsense';
      expect(
        client.authenticateWithCodes(invalidCode)
      ).to.eventually.equal('Failure');
    });
  });

  // This fails correctly
  context('ASYNC bad code, bad expectation', function() {
    it('returns error', async function() {
      const invalidCode = 'nonsense';
      try {
        const result = await client.authenticateWithCodes(invalidCode);
      } catch(error) {
        expect(error).to.equal('Really not this result');
      }
    });
  });

  // This test passes and returns false positive
  context('CHAI_AS_PROMISED bad code, bad expectation', function() {
    it('returns error', function() {
      const invalidCode = 'nonsense';
      expect(
        client.authenticateWithCodes(invalidCode)
      ).to.be.rejectedWith('Really not this result')
    });
  });
});
