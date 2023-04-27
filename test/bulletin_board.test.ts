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
import {expect} from "chai";

let bulletinBoard: BulletinBoard;

beforeEach(() => {
  bulletinBoard = new BulletinBoard(bulletinBoardHost + 'us');
});

afterEach(() => {
  nock.cleanAll();
});

describe('BulletinBoard#registerVoter', () => {
  context('public key already registered on Bulletin Board', () => {
    it('returns an error', async () => {
      nock(bulletinBoardHost).post('/us/voting/registrations')
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
      nock(bulletinBoardHost).post('/us/voting/registrations')
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
      nock(bulletinBoardHost).post('/us/voting/registrations')
        .replyWithError('Some network error');

      await expectError(
        bulletinBoard.createVoterRegistration('authToken', 'parent_address'),
        NetworkError,
        'Network error. Could not connect to Bulletin Board.'
      );
    });
  });
});


describe('BulletinBoard#expireVoterSessions', () => {

  context('nothing goes wrong', ()=>{
    it('returns a response', async () => {
      nock(bulletinBoardHost).post('/us/voting/expirations')
        .reply(200, { expiredSessions: 0 });

      expect(
        await bulletinBoard.expireVoterSessions('authToken', 'parent_address')
      ).to.be.a("object");
    });

    it('the response data indicates how many sessions were expired', async () => {
      nock(bulletinBoardHost).post('/us/voting/expirations')
        .reply(200, { expiredSessions: 0 });

      const response = await bulletinBoard.expireVoterSessions('authToken', 'parent_address');
      expect(response.data).to.eql({expiredSessions: 0});
    });
  })

  context('public key already registered on Bulletin Board', () => {
    it('returns an error', async () => {
      nock(bulletinBoardHost).post('/us/voting/expirations')
        .reply(403, { error: { code: 13, description: 'Public key error' }});

      await expectError(
        bulletinBoard.expireVoterSessions('authToken', 'parent_address'),
        BulletinBoardError,
        'Public key error'
      );
    });
  });

  context('Bulletin Board returns unknown error', () => {
    it('returns an error', async () => {
      nock(bulletinBoardHost).post('/us/voting/expirations')
        .reply(500, { foo: 'bar' });

      await expectError(
        bulletinBoard.expireVoterSessions('authToken', 'parent_address'),
        UnsupportedServerReplyError,
        'Unsupported Bulletin Board server error message: {"foo":"bar"}'
      );
    });
  });

  context('Bulletin Board becomes unreachable', () => {
    it('returns an error', async () => {
      nock(bulletinBoardHost).post('/us/voting/expirations')
        .replyWithError('Some network error');

      await expectError(
        bulletinBoard.expireVoterSessions('authToken', 'parent_address'),
        NetworkError,
        'Network error. Could not connect to Bulletin Board.'
      );
    });
  });
});
