import { expect } from 'chai';
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
    bulletinBoard = new BulletinBoard(bulletinBoardHost + 'mobile-api/us/');
  });

  afterEach(() => {
    nock.cleanAll();
  });

  context('public key already registered on Bulletin Board', () => {
    it('returns an error', async () => {
      nock(bulletinBoardHost).post('/mobile-api/us/register')
        .reply(403, { error: { code: 13, description: 'Public key error' }});

      await expectError(
        bulletinBoard.registerVoter('authToken', 'signature'),
        BulletinBoardError,
        'Public key error'
      );
    });
  });

  context('Bulletin Board returns unknown error', () => {
    it('returns an error', async () => {
      nock(bulletinBoardHost).post('/mobile-api/us/register')
        .reply(500, { foo: 'bar' });

      await expectError(
        bulletinBoard.registerVoter('authToken', 'signature'),
        UnsupportedServerReplyError,
        'Unsupported Bulletin Board server error message: {"foo":"bar"}'
      );
    });
  });

  context('Bulletin Board becomes unreachable', () => {
    it('returns an error', async () => {
      nock(bulletinBoardHost).post('/mobile-api/us/register')
        .replyWithError('Some network error');

      await expectError(
        bulletinBoard.registerVoter('authToken', 'signature'),
        NetworkError,
        'Network error. Could not connect to Bulletin Board.'
      );
    });
  });
});
