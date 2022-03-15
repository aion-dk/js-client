import nock = require('nock');

import { BulletinBoard } from '../lib/av_client/connectors/bulletin_board';
import {
  bulletinBoardHost,
  expectError
} from './test_helpers';
import {
  BulletinBoardError,
  NetworkError,
  UnsupportedServerReplyError
} from '../lib/av_client/errors';

describe('BulletinBoard#registerVoter', () => {
  let bulletinBoard: BulletinBoard;

  beforeEach(() => {
    bulletinBoard = new BulletinBoard(bulletinBoardHost + 'dbb/us/api');
  });

  afterEach(() => {
    nock.cleanAll();
  });

  context('public key already registered on Bulletin Board', () => {
    it('returns an error', async () => {
      nock(bulletinBoardHost).post('/dbb/us/api/registrations')
        .reply(403, { error: { code: 13, description: 'Public key error' }});

      await expectError(
        bulletinBoard.createVoterRegistration('authToken', 'parent_address'),
        BulletinBoardError,
        'Public key error'
      );
    });
  });

  context('Bulletin Board returns unknown error', () => {
    it('returns an error', async () => {
      nock(bulletinBoardHost).post('/dbb/us/api/registrations')
        .reply(500, { foo: 'bar' });

      await expectError(
        bulletinBoard.createVoterRegistration('authToken', 'parent_address'),
        UnsupportedServerReplyError,
        'Unsupported Bulletin Board server error message: {"foo":"bar"}'
      );
    });
  });

  context('Bulletin Board becomes unreachable', () => {
    it('returns an error', async () => {
      nock(bulletinBoardHost).post('/dbb/us/api/registrations')
        .replyWithError('Some network error');

      await expectError(
        bulletinBoard.createVoterRegistration('authToken', 'parent_address'),
        NetworkError,
        'Network error. Could not connect to Bulletin Board.'
      );
    });
  });
});
