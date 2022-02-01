import { expect } from 'chai';
import { checkEligibility } from '../lib/av_client/eligibility_check';

describe('Eligibility Check', () => {
  context('given not eligible voter', () => {
    it('fails when voting on non-eligible contest', async () => {
      const voterGroup = "4";

      const ballotConfigs = {
        "4": { contestUuids: ['1', '2'] },
        "5": { contestUuids: ['3', '4'] }
      };

      const cvr1 = { '1': '1', '2': '4' };
      const cvr2 = { '3': '5', '2': '4' };
      const cvr3 = { '2': '4' };

      expect(checkEligibility(voterGroup, cvr1, ballotConfigs)).to.be.equal(':okay');
      expect(checkEligibility(voterGroup, cvr2, ballotConfigs)).to.be.equal(':not_eligible');
      expect(checkEligibility(voterGroup, cvr3, ballotConfigs)).to.be.equal(':not_eligible');
    });
  });
});
