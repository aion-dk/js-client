import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import { readmeTestSetup, readmeTestTeardown } from './readme_example_helper';

describe('entire voter flow using OTP authorization', () => {
  beforeEach(() => readmeTestSetup());
  afterEach(() => readmeTestTeardown());

  it('returns a receipt', async () => {
    const client = new AVClient('http://us-avx:3000/us/app');
    await client.initialize()

    await client.requestAccessCode('123', 'us-voter-123@aion.dk');

    // ... voter receives email with access code (OTP code) ...

    await client.validateAccessCode('1234');

    await client.registerVoter();

    const cvr = { '1': 'option1', '2': 'optiona' };
    const trackingCode  = await client.constructBallotCryptograms(cvr);
    expect(trackingCode.length).to.eq(64);

    const affidavit = Buffer.from('some bytes, most likely as binary PDF').toString('base64');
    const receipt = await client.submitBallotCryptograms(affidavit);
    expect(receipt).to.have.keys(
      'boardHash',
      'previousBoardHash',
      'registeredAt',
      'serverSignature',
      'voteSubmissionId'
    );
    expect(receipt.previousBoardHash.length).to.eql(64);
  });
});
