import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import { readmeTestSetup, readmeTestTeardown } from './readme_example_helper';

describe('entire voter flow using OTP authorization', () => {
  beforeEach(() => readmeTestSetup());
  afterEach(() => readmeTestTeardown());

  it('returns a receipt', async () => {
    const client = new AVClient('http://localhost:3000/test/app');
    await client.initialize()

    await client.requestAccessCode('123', 'us-voter-123@aion.dk');

    // ... voter receives email with access code (OTP code) ...

    await client.validateAccessCode('1234');

    await client.registerVoter()

    const cvr = { '1': 'option1', '2': 'optiona' };
    const trackingCode  = await client.constructBallotCryptograms(cvr);
    expect(trackingCode).to.eq('12918186c8a535b7c94576dca7b94ef2dbb9a728f63d466a4faf558a2e4be165');

    const affidavit = 'some bytes, most likely as binary PDF';
    const receipt = await client.submitBallotCryptograms(affidavit);
    expect(receipt).to.have.keys(
      'boardHash',
      'previousBoardHash',
      'registeredAt',
      'serverSignature',
      'voteSubmissionId'
    )
    expect(receipt.previousBoardHash).to.eql('b8c006ae94b5f98d684317beaf4784938fc6cf2921d856cc3c8416ea4b510a30')
    expect(receipt.registeredAt).to.eql('2020-03-01T10:00:00.000+01:00')
    expect(receipt.voteSubmissionId).to.eql(7)
  });
});
