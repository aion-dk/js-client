/*eslint-disable @typescript-eslint/no-explicit-any*/
import {AVClient, LatestConfig} from '../lib/av_client';
import latestConfig from './fixtures/latestConfig'
import {expect} from "chai";

describe('generateSignature', () => {
  let client: AVClient;
  const config: LatestConfig = latestConfig

  beforeEach(async () => {
    client = new AVClient('http://nothing.local');
    await client.initialize(config);
  });

  it('generates a signature', async () => {
    const signature = client.generateSignature("hello");

    expect(signature).to.be.a("string");
  });
});
