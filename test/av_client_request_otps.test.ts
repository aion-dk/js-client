import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');

describe('AVClient#requestOTPs', function() {
  let client;
  const expectedNetworkRequests = [];

  beforeEach(function() {
    client = new AVClient(null, 'http://localhost:3000/test/app');
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
          .reply(200, { numberOfOTPs: 2 })
      );

      const pii = 'pii';
      const result = await client.requestOTPs(pii);

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

      return await client.requestOTPs(pii).then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => {
          expectedNetworkRequests.forEach((mock) => mock.done());
          expect(error.message).to.equal('Request failed with status code 404')
        }
      );
    });
  });

  context('no arguments provided', function() {
    it('throws an error', async function() {
      try {
        await client.requestOTPs();
      } catch(error) {
        expect(error.message).to.equal('Please provide personalIdentificationInformation');
      }
    });
  });
});
