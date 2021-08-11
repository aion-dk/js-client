import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');

describe('AVClient#validateAccessCode', function() {
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

  context('OTP services work', function() {
    it('returns success', async function() {
      expectedNetworkRequests.push(
        nock('http://localhost:1111/').post('/authorize')
          .replyWithFile(200, __dirname + '/replies/otp_provider_authorize.valid.json'),
      );

      const otp = '1234';
      const result = await client.validateAccessCode(otp);

      expect(result).to.equal('Success');
      expectedNetworkRequests.forEach((mock) => mock.done());
    })

    it('fails given invalid otps', async function() {
      expectedNetworkRequests.push(
        nock('http://localhost:1111/').post('/authorize')
          .reply(401) // This is what decides that OTP is invalid
      );

      const otps = '1234';

      return client.validateAccessCode(otps).then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => expect(error.message).to.equal('Request failed with status code 401')
      )
      expectedNetworkRequests.forEach((mock) => mock.done());
    })
  });

  context('given wrong number of OTPs', function() {
    it('fails', async function() {
      const otps = ['1234', 'abcd'];

      try {
        await client.validateAccessCode(otps);
        expect.fail('Expected error to be thrown');
      } catch(error) {
        expect(error.message).to.equal('Wrong number of OTPs submitted');
      }
    })
  });
});
