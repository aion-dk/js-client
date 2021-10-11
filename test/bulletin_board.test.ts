import { expect } from 'chai';
import nock = require('nock');

import { BulletinBoard } from '../lib/av_client/connectors/bulletin_board';
import { bulletinBoardHost } from './test_helpers';
import {
  BulletinBoardError,
  NetworkError,
  UnsupportedServerReplyError
} from '../lib/av_client/errors';

describe.only('BulletinBoard#registerVoter', () => {
  let bulletinBoard: BulletinBoard;

  beforeEach(() => {
    bulletinBoard = new BulletinBoard(bulletinBoardHost + 'test/app/');
  });

  afterEach(() => {
    nock.cleanAll();
  });

  context('public key already registered on Bulletin Board', () => {
    it('returns an error', async () => {
      nock(bulletinBoardHost).post('/test/app/register')
        .reply(403, { error: { code: 13, description: 'Public key error' }})

      return bulletinBoard.registerVoter('registrationToken', 'publicKeyToken', 'signature').then(
        () => {
          expect.fail('Expected promise to be rejected');
        },
        (error) => {
          expect(error).to.be.an.instanceof(BulletinBoardError);
          expect(error.message).to.equal('Public key error');
        }
      );
    });
  });

  context('Bulletin Board returns unknown error', () => {
    it('returns an error', async () => {
      nock(bulletinBoardHost).post('/test/app/register')
        .reply(500, { foo: 'bar' })

      return bulletinBoard.registerVoter('registrationToken', 'publicKeyToken', 'signature').then(
        () => {
          expect.fail('Expected promise to be rejected');
        },
        (error) => {
          expect(error).to.be.an.instanceof(UnsupportedServerReplyError);
          expect(error.message).to.equal('Unsupported Bulletin Board server error message: {"foo":"bar"}');
        }
      );
    });
  });

  context('Bulletin Board becomes unreachable', () => {
    it('returns an error', async () => {
      nock(bulletinBoardHost).post('/test/app/register')
        .replyWithError('Some network error')

      return bulletinBoard.registerVoter('registrationToken', 'publicKeyToken', 'signature').then(
        () => {
          expect.fail('Expected promise to be rejected')
        },
        (error) => {
          expect(error).to.be.an.instanceof(NetworkError);
          expect(error.message).to.equal('Network error. Could not connect to Bulletin Board.');
        }
      )
    })
  });
});
