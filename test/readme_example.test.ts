import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import { readmeTestSetup, readmeTestTeardown } from './readme_example_helper';

describe('entire voter flow using OTP authorization', () => {
  beforeEach(() => readmeTestSetup());
  afterEach(() => readmeTestTeardown());

  it('returns a receipt', async () => {
    const client = new AVClient('http://us-avx:3000/dbb/api/us');
    await client.initialize()

    await client.requestAccessCode('123', 'us-voter-123@aion.dk');

    // ... voter receives email with access code (OTP code) ...

    await client.validateAccessCode('1234');

    await client.registerVoter();

    const cvr = {
      '50422d0f-e795-4324-8289-50e3d3459196': '1',
      'd866a7d7-15df-4765-9950-651c0ca1313d': '2'
    };

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
