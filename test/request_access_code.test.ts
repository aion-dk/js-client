import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import {
  bulletinBoardHost,
  expectError,
  voterAuthorizerHost
} from './test_helpers';
import {
  EmailDoesNotMatchVoterRecordError,
  VoterRecordNotFoundError,
  NetworkError,
  UnsupportedServerReplyError
} from '../lib/av_client/errors';


describe('AVClient#requestAccessCode', () => {
  let client: AVClient;
  const expectedNetworkRequests : any[] = [];

  beforeEach(async () => {
    expectedNetworkRequests.push(
      nock(bulletinBoardHost).get('/test/app/config')
        .replyWithFile(200, __dirname + '/replies/otp_flow/get_test_app_config.json')
    );

    client = new AVClient('http://localhost:3000/test/app');
    await client.initialize()
  });

  afterEach(() => {
    nock.cleanAll();
  });

  context('Voter Authorization Coordinator & OTP Provider work', () => {
    it('resolves without errors', async () => {
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
          expect.fail('Expected a resolved promise');
        }
      );
    });
  });

  context('email does not match voter record on Voter Authorization Coordinator', () => {
    it('returns an error', async () => {
      expectedNetworkRequests.push(
        nock(voterAuthorizerHost).post('/create_session')
          .reply(500, { error_code: 'EMAIL_DOES_NOT_MATCH_VOTER_RECORD', error_message: 'Error message from VAC.' })
      );

      await expectError(
        client.requestAccessCode('voter123', 'test@test.dk'),
        EmailDoesNotMatchVoterRecordError,
        'Error message from VAC.'
      );
      expectedNetworkRequests.forEach((mock) => mock.done());
    });
  });

  context('voter id does not match voter record on Voter Authorization Coordinator', () => {
    it('returns an error', async () => {
      expectedNetworkRequests.push(
        nock(voterAuthorizerHost).post('/create_session')
          .reply(500, { error_code: 'VOTER_RECORD_NOT_FOUND_ERROR', error_message: 'Error message from VAC.' })
      );

      await expectError(
        client.requestAccessCode('voter123', 'test@test.dk'),
        VoterRecordNotFoundError,
        'Error message from VAC.'
      );
      expectedNetworkRequests.forEach((mock) => mock.done());
    });
  });

  context('Voter Authorization Coordinator is unavailable', () => {
    it('returns an error', async () => {
      expectedNetworkRequests.push(
        nock(voterAuthorizerHost).post('/create_session')
          .replyWithError('Some network error')
      );

      await expectError(
        client.requestAccessCode('voter123', 'test@test.dk'),
        NetworkError,
        'Network error. Could not connect to Voter Authorization Coordinator.'
      );
      expectedNetworkRequests.forEach((mock) => mock.done());
    });
  });

  context('Voter Authorization Coordinator fails to connect to OTP provider', () => {
    it('returns an error', async () => {
      expectedNetworkRequests.push(
        nock(voterAuthorizerHost).post('/create_session')
          .reply(500, { error_code: 'COULD_NOT_CONNECT_TO_OTP_PROVIDER', error_message: 'Error message from VAC.' })
      );

      await expectError(
        client.requestAccessCode('voter123', 'test@test.dk'),
        NetworkError,
        'Error message from VAC.'
      );
      expectedNetworkRequests.forEach((mock) => mock.done());
    });
  });

  context('Voter Authorization Coordinator returns unknown error message', () => {
    it('returns an error', async () => {
      expectedNetworkRequests.push(
        nock(voterAuthorizerHost).post('/create_session')
          .reply(403, { error_code: 'UNSUPPORTED_NOISE', error_message: 'Expect the unexpected.' })
      );

      await expectError(
        client.requestAccessCode('voter123', 'test@test.dk'),
        UnsupportedServerReplyError,
        'Unsupported server error: Expect the unexpected.'
      );
      expectedNetworkRequests.forEach((mock) => mock.done());
    });
  });

  context('Voter Authorization Coordinator routing changed', () => {
    it('returns an error', async () => {
      expectedNetworkRequests.push(
        nock(voterAuthorizerHost).post('/create_session')
          .reply(404)
      );

      await expectError(
        client.requestAccessCode('voter123', 'test@test.dk'),
        Error,
        'Request failed with status code 404'
      );
      expectedNetworkRequests.forEach((mock) => mock.done());
    });
  });
});
