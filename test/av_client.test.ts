globalThis.TEST_MODE = true;

import AVClient from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');

class StorageAdapter {
  db: object;

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

/** @test {AVClient} */
describe('AVClient#authenticateWithCodes', function() {
  let client;

  beforeEach(function() {
    const storage = new StorageAdapter();
    client = new AVClient(storage, 'http://localhost:3000/test/app');
  });

  context('given valid election codes', function() {
    beforeEach(function() {
      nock('http://localhost:3000/').get('/test/app/config')
        .replyWithFile(200, __dirname + '/replies/config.valid.json');
      nock('http://localhost:3000/').post('/test/app/sign_in')
        .replyWithFile(200, __dirname + '/replies/sign_in.valid.json');
      nock('http://localhost:3000/').post('/test/app/challenge_empty_cryptograms')
        .replyWithFile(200, __dirname + '/replies/challenge_empty_cryptograms.valid.json');
    });

    /** @test {AVClient#authenticateWithCodes} */
    it('returns success', async function() {
      const validCodes = ['aAjEuD64Fo2143', '8beoTmFH13DCV3'];
      const result = await client.authenticateWithCodes(validCodes);
      expect(result).to.equal('Success');
    });
  });

  context('given invalid election codes', function() {
    beforeEach(function() {
      nock('http://localhost:3000/').get('/test/app/config')
        .replyWithFile(200, __dirname + '/replies/config.valid.json');
      nock('http://localhost:3000/').post('/test/app/sign_in')
        .replyWithFile(200, __dirname + '/replies/sign_in.invalid.json');
    });

    /** @test {AVClient#authenticateWithCodes} */
    it('returns an error', async function() {
      const invalidCodes = ['no', 'no'];
      return client.authenticateWithCodes(invalidCodes).then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => expect(error).to.equal('No ballots found for the submitted election codes')
      )
    });
  });
});
