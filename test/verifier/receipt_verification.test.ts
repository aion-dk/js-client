import { AVVerifier } from '../../lib/av_verifier';
import { expect } from 'chai';
import { bulletinBoardHost } from '../test_helpers'
import { LatestConfig } from '../../lib/av_client/types';
import latestConfig from '../fixtures/latestConfig';


describe.only('#isReceiptValid', () => {
  let verifier: AVVerifier;
  const config: LatestConfig = latestConfig;

  beforeEach(async () => {
    verifier = new AVVerifier(bulletinBoardHost + 'us');
    await verifier.initialize(config)
  });

  context('given valid receipt', () => {
    const receipt = "valid"

    it('returns returns true', async () => {
      expect(verifier.isReceiptValid(receipt)).to.be.true
    });
  });

  context('given invalid receipt', () => {
    const receipt = "invalid"

    it('returns returns true', async () => {
      expect(verifier.isReceiptValid(receipt)).to.be.false
    });
  });
});
