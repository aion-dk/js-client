import { AVClient } from '../lib/av_client';
import { expectError, bulletinBoardHost } from './test_helpers';
import { InvalidStateError } from '../lib/av_client/errors';

describe('AVClient functions call order', () => {
  let client: AVClient;

  beforeEach(() => {
    client = new AVClient(bulletinBoardHost + '/dbb/us/api');
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
      client.constructBallot({ reference: '1', contestSelections: [] }),
      InvalidStateError,
      'Cannot construct cryptograms. Voter identity unknown'
    );
  });

  it('throws an error when castBallot is called first', async () => {
    await expectError(
      client.castBallot('affidavit bytes'),
      InvalidStateError,
      'Cannot create cast request cryptograms. Ballot cryptograms not present'
    );
  });

  it('throws an error when spoilBallot is called first', async () => {
    await expectError(
      client.spoilBallot(),
      InvalidStateError,
      'Cannot create cast request cryptograms. Ballot cryptograms not present'
    );
  });
});
