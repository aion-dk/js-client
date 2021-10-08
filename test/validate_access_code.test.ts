import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import { deterministicRandomWords, deterministicMathRandom, resetDeterministicOffset } from './test_helpers';
import sinon = require('sinon');
import { AccessCodeExpired, AccessCodeInvalid, BulletinBoardError, NetworkError, UnsupportedServerReplyError } from '../lib/av_client/errors';

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
        .replyWithFile(200, __dirname + '/replies/otp_flow/get_test_app_config.json')
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

  context('OTP services & Bulletin Board work as expected', () => {
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
          .replyWithFile(200, __dirname + '/replies/otp_flow/post_test_app_register.json')
      );
      expectedNetworkRequests.push(
        nock('http://localhost:3000/').post('/test/app/challenge_empty_cryptograms')
          .replyWithFile(200, __dirname + '/replies/otp_flow/post_test_app_challenge_empty_cryptograms.json')
      );

      const otp = '1234';
      const email = 'blabla@aion.dk';

      await client.requestAccessCode('voter123', email);
      const result = await client.validateAccessCode(otp);
      await client.registerVoter();

      expect(result).to.equal(undefined);
      expectedNetworkRequests.forEach((mock) => mock.done());
    })
  });

  context('wrong OTP', () => {
    it('return an error message', async () => {
      expectedNetworkRequests.push(
        nock('http://localhost:1111/').post('/authorize')
          .reply(403, { errorCode: 'OTP_DOES_NOT_MATCH' })
      );

      const otp = '0000';
      const email = 'blabla@aion.dk';

      await client.requestAccessCode('voter123', email);

      return client.validateAccessCode(otp).then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => {
          expect(error).to.be.an.instanceof(AccessCodeInvalid)
          expect(error.message).to.equal('OTP code invalid')
          expectedNetworkRequests.forEach((mock) => mock.done());
        }
      )
    });
  });

  context('expired OTP', () => {
    it('fails given expired OTP', async () => {
      expectedNetworkRequests.push(
        nock('http://localhost:1111/').post('/authorize')
          .reply(403, { errorCode: 'OTP_SESSION_TIMED_OUT' })
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
          expectedNetworkRequests.forEach((mock) => mock.done());
        }
      );
    });
  });

  context('OTP services work, public key already registered on Bulletin Board', () => {
    it('returns an error', async () => {
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
          .reply(403, { error: { code: 13, description: 'Public key error' }})
      );

      const otp = '1234';
      const email = 'blabla@aion.dk';

      await client.requestAccessCode('voter123', email);
      const result = await client.validateAccessCode(otp);
      return client.registerVoter().then(
        () => {
          expect.fail('Expected promise to be rejected')
        },
        (error) => {
          expect(error).to.be.an.instanceof(BulletinBoardError);
          expect(error.message).to.equal('Public key error');
          expectedNetworkRequests.forEach((mock) => mock.done());
        }
      )
    })
  });

  context('OTP services work, Bulletin Board returns unknown error', () => {
    it('returns an error', async () => {
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
          .reply(500, { foo: 'bar' })
      );

      const otp = '1234';
      const email = 'blabla@aion.dk';

      await client.requestAccessCode('voter123', email);
      const result = await client.validateAccessCode(otp);
      return client.registerVoter().then(
        () => {
          expect.fail('Expected promise to be rejected')
        },
        (error) => {
          expect(error).to.be.an.instanceof(UnsupportedServerReplyError);
          expect(error.message).to.equal('Unsupported Bulletin Board server error message: {"foo":"bar"}');
          expectedNetworkRequests.forEach((mock) => mock.done());
        }
      )
    })
  });

  context('OTP services work, Bulletin Board becomes unreachable', () => {
    it('returns an error', async () => {
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
          .replyWithError('Some network error')
      );

      const otp = '1234';
      const email = 'blabla@aion.dk';

      await client.requestAccessCode('voter123', email);
      const result = await client.validateAccessCode(otp);
      return client.registerVoter().then(
        () => {
          expect.fail('Expected promise to be rejected')
        },
        (error) => {
          expect(error).to.be.an.instanceof(NetworkError);
          expect(error.message).to.equal('Network error. Could not connect to Bulletin Board.');
          expectedNetworkRequests.forEach((mock) => mock.done());
        }
      )
    })
  });

  context('OTP services work, Bulletin Board routing changed', () => {
    it('returns an error', async () => {
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
          .reply(404)
      );

      const otp = '1234';
      const email = 'blabla@aion.dk';

      await client.requestAccessCode('voter123', email);
      const result = await client.validateAccessCode(otp);
      return client.registerVoter().then(
        () => {
          expect.fail('Expected promise to be rejected')
        },
        (error) => {
          expect(error).to.be.an.instanceof(Error);
          expect(error.message).to.equal('Request failed with status code 404');
          expectedNetworkRequests.forEach((mock) => mock.done());
        }
      )
    })
  });

  context('OTP Provider returns an unsupported error message', async () => {
    it('returns an error message', async () => {
      expectedNetworkRequests.push(
        nock('http://localhost:1111/').post('/authorize')
          .reply(403, { garbage: 'nonsense' })
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
          expect(error.message).to.equal('Unsupported OTP Provider error message: {"garbage":"nonsense"}')
          expectedNetworkRequests.forEach((mock) => mock.done());
        }
      );
    });
  });

  context('OTP Provider returns an unsupported error code', async () => {
    it('returns an error message', async () => {
      expectedNetworkRequests.push(
        nock('http://localhost:1111/').post('/authorize')
          .reply(403, { errorCode: 'UNKNOWN_ERROR_CODE', errorMessage: 'Not supported yet' })
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
          expect(error.message).to.equal('Unsupported OTP Provider error message: Not supported yet')
          expectedNetworkRequests.forEach((mock) => mock.done());
        }
      );
    });
  });

  context('OTP Provider routing changed', async () => {
    it('returns an error message', async () => {
      expectedNetworkRequests.push(
        nock('http://localhost:1111/').post('/authorize')
          .reply(404)
      );

      const otp = '1234';
      const email = 'blabla@aion.dk';

      await client.requestAccessCode('voter123', email);

      return client.validateAccessCode(otp).then(
        () => {
          expect.fail('Expected promise to be rejected')
        },
        (error) => {
          expect(error.message).to.equal('Request failed with status code 404');
          expectedNetworkRequests.forEach((mock) => mock.done());
        }
      );
    });
  });

  context('OTP Provider connection timeout', function() {
    it('returns network error', async function () {
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
          expect(error.message).to.equal('Network error. Could not connect to OTP Provider.')
          expectedNetworkRequests.forEach((mock) => mock.done());
        }
      );
    });
  });

  context('OTP Provider host unavailable', function() {
    it('returns network error', async function(){
      const otp = '1234';
      const email = 'blabla@aion.dk'

      let configWithBadURL = client.getElectionConfig();
      configWithBadURL.services.otp_provider.url = 'http://sdguet432t4tjsdjf.does-not-exist';
      await client.initialize(configWithBadURL);

      await client.requestAccessCode('voter123', 'blabla@aion.dk');

      return client.validateAccessCode(otp).then(
        () => {
          expect.fail('Expected promise to be rejected')
        },
        (error) => {
          expect(error).to.be.an.instanceof(NetworkError);
          expect(error.message).to.equal('Network error. Could not connect to OTP Provider.')
          expectedNetworkRequests.forEach((mock) => mock.done());
        }
      );
    })
  });
});
