import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import {
  bulletinBoardHost,
  voterAuthorizerHost
} from './test_helpers';

describe('AVClient#requestAccessCode', function() {
  let client: AVClient;
  let sandbox;
  const expectedNetworkRequests : any[] = [];

  beforeEach(async () => {
    expectedNetworkRequests.push(
      nock(bulletinBoardHost).get('/test/app/config')
        .replyWithFile(200, __dirname + '/replies/otp_flow/get_test_app_config.json')
    );

    client = new AVClient('http://localhost:3000/test/app');
    await client.initialize()
  });

  afterEach(function() {
    nock.cleanAll();
  });

  context('Voter Authorization Coordinator & OTP Provider work', function() {
    it('resolves without errors', async function() {
      expectedNetworkRequests.push(
        nock(voterAuthorizerHost).post('/create_session')
          .reply(200)
      );

      return client.requestAccessCode('voter123', 'test@test.dk').then(
        (result) => {
          expect(result).to.eql(undefined);
          expectedNetworkRequests.forEach((mock) => mock.done());
        },
        (error) => {
          console.error(error);
          expect.fail('Expected a resolved promise');
        }
      );
    });
  });

  context('email does not match voter record on Voter Authorization Coordinator', function() {
    it('returns an error', async function() {
      expectedNetworkRequests.push(
        nock(voterAuthorizerHost).post('/create_session')
          .reply(500, { error_code: 'EMAIL_DOES_NOT_MATCH_VOTER_RECORD', error_message: 'Error message from VAC.' })
      );

      return await client.requestAccessCode('voter123', 'test@test.dk').then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => {
          expect(error.message).to.equal('Error message from VAC.');
          expectedNetworkRequests.forEach((mock) => mock.done());
        }
      );
    });
  });

  context('Voter Authorization Coordinator is unavailable', function() {
    it('returns an error', async function() {
      expectedNetworkRequests.push(
        nock(voterAuthorizerHost).post('/create_session')
          .replyWithError('Some network error')
      );

      return await client.requestAccessCode('voter123', 'test@test.dk').then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => {
          expect(error.message).to.equal('Network error. Could not connect to Voter Authorization Coordinator.');
          expectedNetworkRequests.forEach((mock) => mock.done());
        }
      );
    });
  });

  context('Voter Authorization Coordinator fails to connect to OTP provider', function() {
    it('returns an error', async function() {
      expectedNetworkRequests.push(
        nock(voterAuthorizerHost).post('/create_session')
          .reply(500, { error_code: 'COULD_NOT_CONNECT_TO_OTP_PROVIDER', error_message: 'Error message from VAC.' })
      );

      return await client.requestAccessCode('voter123', 'test@test.dk').then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => {
          expect(error.message).to.equal('Error message from VAC.');
          expectedNetworkRequests.forEach((mock) => mock.done());
        }
      );
    });
  });

  context('Voter Authorization Coordinator returns unknown error message', function() {
    it('returns an error', async function() {
      expectedNetworkRequests.push(
        nock(voterAuthorizerHost).post('/create_session')
          .reply(403, { error_code: 'UNSUPPORTED_NOISE', error_message: 'Expect the unexpected.' })
      );

      return await client.requestAccessCode('voter123', 'test@test.dk').then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => {
          expect(error.message).to.equal('Unsupported server error: Expect the unexpected.');
          expectedNetworkRequests.forEach((mock) => mock.done());
        }
      );
    });
  });

  context('Voter Authorization Coordinator routing changed', function() {
    it('returns an error', async function() {
      expectedNetworkRequests.push(
        nock(voterAuthorizerHost).post('/create_session')
          .reply(404)
      );

      return await client.requestAccessCode('voter123', 'test@test.dk').then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => {
          expect(error.message).to.equal('Request failed with status code 404');
          expectedNetworkRequests.forEach((mock) => mock.done());
        }
      );
    });
  });
});
