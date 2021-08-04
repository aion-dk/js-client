import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');

describe('AVClient#getNumberOfOTPs', function() {
  let client;

  beforeEach(function() {
    client = new AVClient('http://localhost:3000/test/app');
  });

  afterEach(function() {
    nock.cleanAll();
  });

  context('valid config fetched', function() {
    beforeEach(function() {
      nock('http://localhost:3000/').get('/test/app/config')
        .replyWithFile(200, __dirname + '/replies/config.valid.json');
    });

    it('returns number of OTPs', async function() {
      expect(await client.getNumberOfOTPs()).to.equal(2);
    });
  });

  context('config cannot be fetched', function() {
    beforeEach(function() {
      nock('http://localhost:3000/').get('/test/app/config')
        .reply(404)
    });

    it('returns an error', async function() {
      return await client.getNumberOfOTPs().then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => expect(error.message).to.equal('Request failed with status code 404')
      )
    });
  });
});
