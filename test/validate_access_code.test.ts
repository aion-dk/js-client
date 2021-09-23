import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import { deterministicRandomWords, deterministicMathRandom, resetDeterministicOffset } from './test_helpers';
import sinon = require('sinon');
import { AccessCodeExpired, AccessCodeInvalid, NetworkError, UnsupportedServerReplyError } from "../lib/av_client/errors";

const sjcl = require('../lib/av_client/sjcl')

describe('AVClient#validateAccessCode', () => {
  let client: AVClient;
  let sandbox;
  const expectedNetworkRequests : any[] = [];

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    sandbox.stub(Math, 'random').callsFake(deterministicMathRandom);
    sandbox.stub(sjcl.prng.prototype, 'randomWords').callsFake(deterministicRandomWords);
    resetDeterministicOffset();

    expectedNetworkRequests.push(
      nock('http://localhost:3000/').get('/test/app/config')
        .replyWithFile(200, __dirname + '/replies/otp_flow/get_config.json')
    );
    expectedNetworkRequests.push(
      nock('http://localhost:1234/').post('/create_session')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_create_session.json')
    );

    client = new AVClient('http://localhost:3000/test/app');
    await client.initialize()
  });

  afterEach(() => {
    sandbox.restore();
    nock.cleanAll();
  });

  context('OTP services work', () => {
    it('resolves without errors', async () => {
      expectedNetworkRequests.push(
        nock('http://localhost:1111/').post('/authorize')
          .replyWithFile(200, __dirname + '/replies/otp_flow/post_authorize.json')
      );
      expectedNetworkRequests.push(
        nock('http://localhost:1234/').post('/request_authorization')
          .replyWithFile(200, __dirname + '/replies/otp_flow/post_request_authorization.json')
      );
      expectedNetworkRequests.push(
        nock('http://localhost:3000/').post('/test/app/register')
          .replyWithFile(200, __dirname + '/replies/otp_flow/post_register.json')
      );
      expectedNetworkRequests.push(
        nock('http://localhost:3000/').post('/test/app/challenge_empty_cryptograms')
          .replyWithFile(200, __dirname + '/replies/otp_flow/post_challenge_empty_cryptograms.json')
      );

      const otp = '1234';
      const email = 'blabla@aion.dk';

      await client.requestAccessCode('voter123', email);
      const result = await client.validateAccessCode(otp);
      await client.registerVoter();

      expect(result).to.equal(undefined);
      expectedNetworkRequests.forEach((mock) => mock.done());
    })

    it('fails given invalid OTP', async () => {
      expectedNetworkRequests.push(
        nock('http://localhost:1111/').post('/authorize')
          .replyWithFile(403, __dirname + '/replies/otp_provider_authorize.invalid.json'),
      );

      const otp = '0000';
      const email = 'blabla@aion.dk';

      await client.requestAccessCode('voter123', email);

      return client.validateAccessCode(otp).then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => {
          expect(error).to.be.an.instanceof(AccessCodeInvalid)
          expect(error.message).to.equal('OTP code invalid')
        }
      )
      expectedNetworkRequests.forEach((mock) => mock.done());
    })

    it('fails given expired OTP', async function(){
      expectedNetworkRequests.push(
        nock('http://localhost:1111/').post('/authorize')
          .replyWithFile(403, __dirname + '/replies/otp_provider_authorize.expired.json'),
      );

      const otp = '1234';
      const email = 'blabla@aion.dk';

      await client.requestAccessCode('voter123', email);

      return client.validateAccessCode(otp).then(
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

    it('fails if the server returns unsupported response', async function(){
      expectedNetworkRequests.push(
        nock('http://localhost:1111/').post('/authorize')
          .reply(403, { nonsense: 'garbage' })
      );

      const otp = '1234';
      const email = 'blabla@aion.dk';

      await client.requestAccessCode('voter123', email);

      return client.validateAccessCode(otp).then(
        () => {
          expect.fail('Expected promise to be rejected')
        },
        (error) => {
          expect(error).to.be.an.instanceof(UnsupportedServerReplyError);
          expect(error.message).to.equal('Unsupported server error message: {"nonsense":"garbage"}');
        }
      );

      expectedNetworkRequests.forEach((mock) => mock.done());
    });

    it('fails if the server returns unsupported error response', async function(){
      expectedNetworkRequests.push(
        nock('http://localhost:1111/').post('/authorize')
          .reply(403, { error: 'some yet unsupported error message' })
      );

      const otp = '1234';
      const email = 'blabla@aion.dk';

      await client.requestAccessCode('voter123', email);

      return client.validateAccessCode(otp).then(
        () => {
          expect.fail('Expected promise to be rejected')
        },
        (error) => {
          expect(error).to.be.an.instanceof(UnsupportedServerReplyError);
          expect(error.message).to.equal('Unsupported server error: some yet unsupported error message')
        }
      );

      expectedNetworkRequests.forEach((mock) => mock.done());
    });
  });

  context('OTP services are unavailable', function() {
    it('returns network error on timeout', async function () {
      expectedNetworkRequests.push(
        nock('http://localhost:1111/').post('/authorize')
          .replyWithError({code: 'ETIMEDOUT'})
      );

      const otp = '1234';
      
      await client.requestAccessCode('voter123', 'blabla@aion.dk');

      
      return client.validateAccessCode(otp).then(
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

      await client.initialize({
        ...client.getElectionConfig(),
        OTPProviderURL: 'http://sdkghskfglksjlkfgjdlkfjglkdfjglkjdlfgjlkdjgflkjdlkfgjlkdfg.com'
      })

      await client.requestAccessCode('voter123', 'blabla@aion.dk');

      return client.validateAccessCode(otp).then(
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
