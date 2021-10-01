import { validateCvr } from '../lib/av_client/cvr_validation';
import { Option } from '../lib/av_client/types';
import { expect } from 'chai';

describe('validateCvr', () => {
  context('given invalid CVR', () => {
    it('fails when voting on invalid contests or invalid options', async () => {
      const template = { title: {}, vote_encoding_type: 0, description: {}, write_in: false }

      const contest1 = { ...template, id: 1, options: createOptions(['option1', 'option2']) };
      const contest2 = { ...template, id: 2, options: createOptions(['optionA', 'optionB']) };
      const contest3 = { ...template, id: 3, options: createOptions(['optionX', 'optionY']) };

      const ballot1 = [contest1, contest2];
      const ballot2 = [contest1, contest3];

      const cvr1 = { '1': 'option1', '3': 'optionX' };
      const cvr2 = { '1': 'option1', '3': 'optionINVALID' };

      expect(validateCvr(cvr2, ballot2)).to.be.equal(':invalid_option')
      expect(validateCvr(cvr2, ballot1)).to.be.equal(':invalid_contest')
      expect(validateCvr(cvr1, ballot2)).to.be.equal(':okay')
    });
  });

  const createOptions = (optionHandles: string[]): Option[] => {
    return optionHandles.map((handle, i) => {
      return {
        "id": i,
        "handle": handle,
        "title": {},
        "subtitle": {},
        "description": {},
        "url": {},
        "video_url": {},
        "image": null,
        "ancestry": null,
        "selectable": true
      }
    })
  }
});
