import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import { deterministicRandomWords, deterministicMathRandom, resetDeterministicOffset } from './test_helpers';
import sinon = require('sinon');
import { AccessCodeExpired, AccessCodeInvalid, NetworkError } from "../lib/av_client/errors";
const sjcl = require('../lib/av_client/sjcl')
const Crypto = require('../lib/av_client/aion_crypto.js')()

describe('AVClient#validateAccessCode', () => {
  let client: AVClient;
  let sandbox;
  const expectedNetworkRequests : any[] = [];

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(Math, 'random').callsFake(deterministicMathRandom);
    sandbox.stub(sjcl.prng.prototype, 'randomWords').callsFake(deterministicRandomWords);
    resetDeterministicOffset();

    client = new AVClient('http://localhost:3000/test/app');
    expectedNetworkRequests.push(
      nock('http://localhost:3000/').get('/test/app/config')
        .replyWithFile(200, __dirname + '/replies/otp_flow/get_config.json')
    );
    expectedNetworkRequests.push(
      nock('http://localhost:1234/').post('/create_session')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_create_session.json')
    );
    expectedNetworkRequests.push(
      nock('http://localhost:1234/').post('/start_identification')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_start_identification.json')
    )
  });

  afterEach(() => {
    sandbox.restore();
    nock.cleanAll();
  });

  context('OTP services work', () => {
    it('returns success', async () => {
      expectedNetworkRequests.push(
        nock('http://localhost:1111/').post('/authorize')
          .replyWithFile(200, __dirname + '/replies/otp_flow/post_authorize.json')
      );
      expectedNetworkRequests.push(
        nock('http://localhost:3000/').post('/test/app/register')
          .replyWithFile(200, __dirname + '/replies/otp_flow/post_register.json')
      );
      expectedNetworkRequests.push(
        nock('http://localhost:3000/').post('/test/app/challenge_empty_cryptograms')
          .replyWithFile(200, __dirname + '/replies/otp_flow/post_challenge_empty_cryptograms.json')
      );

      await client.requestAccessCode('voter123');

      const otp = '1234';
      const email = 'blabla@aion.dk';
      const result = await client.validateAccessCode(otp, email);

      expect(result).to.equal('OK');
      expectedNetworkRequests.forEach((mock) => mock.done());
    })

    it('fails given invalid otps', async () => {
      expectedNetworkRequests.push(
        nock('http://localhost:1111/').post('/authorize')
          .replyWithFile(403, __dirname + '/replies/otp_provider_authorize.invalid.json'),
      );

      await client.requestAccessCode('voter123');

      const otp = '0000';
      const email = 'blabla@aion.dk';

      return client.validateAccessCode(otp, email).then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => {
          expect(error).to.be.an.instanceof(AccessCodeInvalid)
          expect(error.message).to.equal('OTP code invalid')
        }
      )
      expectedNetworkRequests.forEach((mock) => mock.done());
    })

    it('fails given expired otp', async function(){
      expectedNetworkRequests.push(
        nock('http://localhost:1111/').post('/authorize')
          .replyWithFile(403, __dirname + '/replies/otp_provider_authorize.expired.json'),
      );

      await client.requestAccessCode('voter123');

      const otp = '1234';
      const email = 'blabla@aion.dk';
      return client.validateAccessCode(otp, email).then(
        () => {
          expect.fail('Expected promise to be rejected')
        },
        (error) => {
          expect(error).to.be.an.instanceof(AccessCodeExpired);
          expect(error.message).to.equal('OTP code expired')
        }
      );

      expectedNetworkRequests.forEach((mock) => mock.done());
    })
  });

  context('given wrong number of OTPs', () => {
    it('fails', async () => {
      await client.requestAccessCode('voter123');

      const otps = ['1234', 'abcd']
      const email = 'blabla@aion.dk'

      try {
        await client.validateAccessCode(otps, email);
        expect.fail('Expected error to be thrown');
      } catch(error) {
        expect(error.message).to.equal('Wrong number of OTPs submitted');
      }
    })
  });

  context('OTP services is unavailable', function() {
    it('returns network error on timeout', async function () {
      expectedNetworkRequests.push(
        nock('http://localhost:1111/').post('/authorize')
          .replyWithError({code: 'ETIMEDOUT'})
      );

      await client.requestAccessCode('voter123');

      const otp = '1234';
      const email = 'blabla@aion.dk';
      return client.validateAccessCode(otp, email).then(
        () => {
          expect.fail('Expected promise to be rejected')
        },
        (error) => {
          expect(error).to.be.an.instanceof(NetworkError);
          expect(error.message).to.equal('Network error')
        }
      );
    })

    it('returns network error on host not available', async function(){
      const otp = '1234';
      const email = 'blabla@aion.dk'

      const clientWithBadOtpProvider = new AVClient('http://localhost:3000/test/app');

      sandbox.stub(clientWithBadOtpProvider, 'OTPProviderUrls').callsFake(() =>
        ['http://sdkghskfglksjlkfgjdlkfjglkdfjglkjdlfgjlkdjgflkjdlkfgjlkdfg.com']
      );

      await clientWithBadOtpProvider.requestAccessCode('voter123');

      return clientWithBadOtpProvider.validateAccessCode(otp, email).then(
        () => {
          expect.fail('Expected promise to be rejected')
        },
        (error) => {
          expect(error).to.be.an.instanceof(NetworkError);
          expect(error.message).to.equal('Network error')
        }
      );
    })
  });
});
