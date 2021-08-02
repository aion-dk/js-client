import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');

describe('AVClient#initiateDigitalReturn', function() {
  let client;
  const expectedNetworkRequests : any[] = [];

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

  context('authorized', function() {
    it('returns "Authorized"', async function() {
      expectedNetworkRequests.push(
        nock('http://localhost:1234/').post('/initiate')
          .reply(200),
        nock('http://localhost:1111/').post('/authorize')
          .replyWithFile(200, __dirname + '/replies/otp_provider_authorize.valid.json'),
        nock('http://localhost:2222/').post('/authorize')
          .replyWithFile(200, __dirname + '/replies/otp_provider_authorize.valid.json')
      );

      // Initiate
      const pii = 'pii';
      await client.initiateDigitalReturn(pii);

      // Finalize
      const otps = ['1234', 'abc'];
      await client.finalizeAuthorization(otps);

      // Initiating again will just return `true`
      const result = await client.initiateDigitalReturn(pii);
      expect(result).to.equal('Authorized');

      expectedNetworkRequests.forEach((mock) => mock.done());
    });
  });

  context('unauthorized, OTP services work', function() {
    it('returns "Unauthorized"', async function() {
      expectedNetworkRequests.push(
        nock('http://localhost:1234/').post('/initiate')
          .reply(200)
      );

      const pii = 'pii';
      const result = await client.initiateDigitalReturn(pii);

      expect(result).to.equal('Unauthorized')

      expectedNetworkRequests.forEach((mock) => mock.done());
    });
  });

  context('unauthorized, OTP service is unavailable', function() {
    it('returns an error', async function() {
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
