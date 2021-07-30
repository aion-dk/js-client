import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');

describe('AVClient#initiateDigitalReturn', function() {
  let client;
  const expectedNetworkRequests = [];

  beforeEach(function() {
    client = new AVClient('http://localhost:3000/test/app');
    expectedNetworkRequests.push(
      nock('http://localhost:3000/').get('/test/app/config')
        .replyWithFile(200, __dirname + '/replies/config.valid.json')
    );
  });

  afterEach(function() {
    nock.cleanAll();
  });

  context('OTP services work', function() {
    it('returns number of OTPs required', async function() {
      expectedNetworkRequests.push(
        nock('http://localhost:1234/').post('/initiate')
          .reply(200)
      );

      const pii = 'pii';
      const result = await client.initiateDigitalReturn(pii);

      expect(result).to.eql({
        numberOfOTPs: 2
      });

      expectedNetworkRequests.forEach((mock) => mock.done());
    });
  });

  context('OTP service is unavailable', function() {
    it('returns number of OTPs required', async function() {
      expectedNetworkRequests.push(
        nock('http://localhost:1234/').post('/initiate')
          .reply(404)
      );

      const pii = 'pii';

      return await client.initiateDigitalReturn(pii).then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => {
          expectedNetworkRequests.forEach((mock) => mock.done());
          expect(error.message).to.equal('Request failed with status code 404')
        }
      );
    });
  });
});
