import { validateCvr } from '../lib/av_client/cvr_validation';
import { MarkingType, Option } from '../lib/av_client/types';
import { expect } from 'chai';

const markingType: MarkingType = {
  minMarks: 1,
  maxMarks: 1,
  encoding: {
    codeSize: 1,
    maxSize: 1,
    cryptogramCount: 1
  }
}

const template = {
  vote_encoding_type: 0,
  description: {},
  write_in: false,
  markingType: markingType,
  resultType: {
    name: "Something"
  },
  subtitle: { en: "Some subtitle" },
  title: { en: "Some title" },
};

describe('validateCvr', () => {
  context('given invalid CVR', () => {
    it('fails when voting on invalid contests or invalid options', async () => {
      const contest1 = { ...template, reference: 'a', options: createOptions(['1', '2']) };
      const contest2 = { ...template, reference: 'b', options: createOptions(['3', '4']) };
      const contest3 = { ...template, reference: 'c', options: createOptions(['5', '6']) };

      const allContests = {a: contest1, b: contest2, c: contest3 };

      const cvr_invalidcontest = { 'a': '1', 'c': '5' };
      const cvr_invalidoption = { 'a': '1', 'b': '7' };
      const cvr_missingcontest = { 'a': '2' };
      const cvr_valid = { 'a': '1', 'b': '4' };

      const VOTER_GROUP = "4";

      const ballotConfigs = {
        [VOTER_GROUP]: {
          voterGroup: VOTER_GROUP,
          contestReferences: [ "a", "b" ]
        }
      };

      expect(validateCvr(cvr_invalidoption, VOTER_GROUP, ballotConfigs, allContests)).to.be.equal(':invalid_option')
      expect(validateCvr(cvr_invalidcontest, VOTER_GROUP, ballotConfigs, allContests)).to.be.equal(':invalid_contest')
      expect(validateCvr(cvr_missingcontest, VOTER_GROUP, ballotConfigs, allContests)).to.be.equal(':missing_contest_in_cvr')
      expect(validateCvr(cvr_valid, VOTER_GROUP, ballotConfigs, allContests)).to.be.equal(':okay')

      expect(
        () => validateCvr(cvr_invalidcontest, "non_existing_ballot_config", ballotConfigs, allContests)
      ).to.throw();
    });
  });

  const createOptions = (optionReferences: string[]): Option[] => {
    return optionReferences.map((reference) => {
      return {
        "reference": reference,
        "code": parseInt(reference),
        "title": {},
        "subtitle": {},
        "description": {},
      }
    })
  }
});
