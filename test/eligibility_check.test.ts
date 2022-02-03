import { expect } from 'chai';
import { checkEligibility } from '../lib/av_client/eligibility_check';

describe('Eligibility Check', () => {
  context('given not eligible voter', () => {
    it('fails when voting on non-eligible contest', async () => {
      const voterGroup = "4";

      const ballotConfigs = {
        "4": { contestUuids: ['a', 'b'] },
        "5": { contestUuids: ['c', 'd'] }
      };

      const cvr1 = { 'a': 1, 'b': 4 };
      const cvr2 = { 'c': 5, 'd': 4 };
      const cvr3 = { 'b': 4 };

      expect(checkEligibility(voterGroup, cvr1, ballotConfigs)).to.be.equal(':okay');
      expect(checkEligibility(voterGroup, cvr2, ballotConfigs)).to.be.equal(':not_eligible');
      expect(checkEligibility(voterGroup, cvr3, ballotConfigs)).to.be.equal(':not_eligible');
    });
  });
});
