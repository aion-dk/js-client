import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import { readmeTestSetup, readmeTestTeardown } from './readme_example_helper';

describe('entire voter flow using OTP authorization', () => {
  beforeEach(() => readmeTestSetup());
  afterEach(() => readmeTestTeardown());

  it('returns a receipt', async () => {
    const client = new AVClient('http://localhost:3000/test/app');
    await client.initialize()

    await client.requestAccessCode('some PII info', 'voter@foo.bar');

    // ... voter receives email with access code (OTP code) ...

    await client.validateAccessCode('1234');

    await client.registerVoter()

    const cvr = { '1': 'option1', '2': 'optiona' };
    const trackingCode  = await client.constructBallotCryptograms(cvr);
    expect(trackingCode).to.eq('12918186c8a535b7c94576dca7b94ef2dbb9a728f63d466a4faf558a2e4be165');

    const affidavit = 'some bytes, most likely as binary PDF';
    const receipt = await client.submitBallotCryptograms(affidavit);
    expect(receipt).to.eql({
      previousBoardHash: '0de4ec18961c66cc75ddaeb4a55bdd01c2200eed787be5ea7e7ed0284e724a3b',
      boardHash: '4874559661833c93ac7c06610d5c111c698d3a2f850f35346ddc43b526fe373e',
      registeredAt: '2020-03-01T10:00:00.000+01:00',
      serverSignature: '11c1ba9b9738eea669dfb79358cd906ad341a466ebe02d5f39ea215585c18b27,bdafb61f0c2facedebc2aeba252bec2a7fe1e123f6affe3fc2fc87db650c5546',
      voteSubmissionId: 7
    });
  });
});
