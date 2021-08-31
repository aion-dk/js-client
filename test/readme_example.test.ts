import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import { readmeTestSetup, readmeTestTeardown } from './readme_example_helper';

describe('entire voter flow using OTP authorization', () => {
  beforeEach(() => readmeTestSetup());
  afterEach(() => readmeTestTeardown());

  it('returns a receipt', async () => {
    const client = new AVClient('http://localhost:3000/test/app');
    await client.initialize()

    await client.requestAccessCode('some PII info');

    // ... voter receives email with access code (OTP code) ...

    await client.validateAccessCode('1234', 'voter@foo.bar');

    const cvr = { '1': 'option1', '2': 'optiona' };
    const trackingCode  = await client.constructBallotCryptograms(cvr);
    expect(trackingCode).to.eq('da46ec752fd9197c0d77e6d843924b082b8b23350e8ac5fd454051dc1bf85ad2');

    const affidavit = 'some bytes, most likely as binary PDF';
    const receipt = await client.submitBallotCryptograms(affidavit);
    expect(receipt).to.eql({
      previousBoardHash: 'd8d9742271592d1b212bbd4cbbbe357aef8e00cdbdf312df95e9cf9a1a921465',
      boardHash: '87abbdea83326ba124a99f8f56ba4748f9df97022a869c297aad94c460804c03',
      registeredAt: '2020-03-01T10:00:00.000+01:00',
      serverSignature: 'bfaffbaf8778abce29ea98ebc90ca91e091881480e18ef31da815d181cead1f6,8977ad08d4fc3b1d9be311d93cf8e98178142685c5fbbf703abf2188a8d1c862',
      voteSubmissionId: 6
    });
  });
});
