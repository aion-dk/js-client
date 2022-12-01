import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import { readmeTestSetup, readmeTestTeardown } from './readme_example_helper';
import { BallotSelection } from '../lib/av_client/types';

describe('entire voter flow using OTP authorization', () => {
  beforeEach(() => readmeTestSetup());
  afterEach(() => readmeTestTeardown());

  it.skip('returns a receipt', async () => {
    const client = new AVClient('http://us-avx:3000/dbb/us/api');
    await client.initialize()

    await client.requestAccessCode('123', 'us-voter-123@aion.dk');

    // ... voter receives email with access code (OTP code) ...

    await client.validateAccessCode('1234');

    await client.registerVoter();

    const ballotSelection: BallotSelection = {
      reference: 'ballot-1',
      contestSelections: [
        {
          reference: 'contest ref 1',
          optionSelections: [{reference: 'option ref 1'}]          
        },
        {
          reference: 'contest ref 2',
          optionSelections: [{reference: 'option ref 3'}]
        }
      ]
    }

    const trackingCode  = await client.constructBallot(ballotSelection);
    expect(trackingCode.length).to.eq(64);

    const affidavit = Buffer.from('some bytes, most likely as binary PDF').toString('base64');
    const ballotTrackingCode = await client.castBallot(affidavit);

    expect(typeof ballotTrackingCode === "string").to.be.true;
  });
});
