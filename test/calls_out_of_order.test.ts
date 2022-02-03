import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import nock = require('nock');
import {
  expectError,
  resetDeterminism,
  bulletinBoardHost,
  OTPProviderHost,
  voterAuthorizerHost
} from './test_helpers';
import { InvalidStateError } from '../lib/av_client/errors';

describe('AVClient functions call order', () => {
  let client: AVClient;

  beforeEach(() => {
    client = new AVClient('http://us-avx:3000/dbb/us/api');
  });

  it('throws an error when validateAccessCode is called first', async () => {
    await expectError(
      client.validateAccessCode('1234'),
      InvalidStateError,
      'Cannot validate access code. Access code was not requested.'
    );
  });

  it('throws an error when constructBallotCryptograms is called first', async () => {
    await expectError(
      client.constructBallotCryptograms({ '1': 1, '2': 4 }),
      InvalidStateError,
      'Cannot construct ballot cryptograms. Voter registration not completed successfully'
    );
  });

  it('throws an error when submitBallotCryptograms is called first', async () => {
    await expectError(
      client.submitBallotCryptograms('affidavit bytes'),
      InvalidStateError,
      'Cannot submit cryptograms. Voter identity unknown or no open envelopes'
    );
  });
});
