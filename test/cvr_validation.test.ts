import { validateCvr } from '../lib/av_client/cvr_validation';
import { ContestConfig, Option } from '../lib/av_client/types';
import { expect } from 'chai';

describe('validateCvr', () => {
  context('given invalid CVR', () => {
    it('fails when voting on invalid contests or invalid options', async () => {
      const template = {
        vote_encoding_type: 0,
        description: {},
        write_in: false,
        markingType: {
          style: "regular",
          handleSize: 1
        },
        resultType: {
          name: "Something"
        },
        subtitle: { en: "Some subtitle" },
        title: { en: "Some title" }
      }

      const contest1 = { ...template, uuid: 'a', options: createOptions(['1', '2']) };
      const contest2 = { ...template, uuid: 'b', options: createOptions(['3', '4']) };
      const contest3 = { ...template, uuid: 'c', options: createOptions(['5', '6']) };

      const contests1 = [contest1, contest2];
      const contests2 = [contest1, contest3];

      const cvr1 = { 'a': '1', 'c': '5' };
      const cvr2 = { 'a': '1', 'c': '7' };

      expect(validateCvr(cvr2, contests2)).to.be.equal(':invalid_option')
      expect(validateCvr(cvr2, contests1)).to.be.equal(':invalid_contest')
      expect(validateCvr(cvr1, contests2)).to.be.equal(':okay')
    });
  });

  const createOptions = (optionHandles: string[]): Option[] => {
    return optionHandles.map((handle, i) => {
      return {
        "handle": handle,
        "title": {},
        "subtitle": {},
        "description": {},
      }
    })
  }
});
