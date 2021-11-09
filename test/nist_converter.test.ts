import { expect } from 'chai';
import * as fs from 'fs'
import { expectError } from './test_helpers';
import NistConverter from '../lib/util/nist_converter';


describe('Util#nistCvrToAvCvr', () => {
  const readFile = (fileName) => {
    return fs.readFileSync(require.resolve(fileName), 'utf8');
  }

  context('NIST converter transforms 1500-103 XML to json', () => {
    it('Convert simple selection for single contest', async () => {
      var xml = readFile('./cvrs/jetsons_bedrock-precinct2_cvr.xml');

      const result = NistConverter.nistCvrToAvCvr(xml);

      expect(result).to.eql({
        'contest-ballot-measure-gadget-county-1': 'contest-ballot-measure-1--selection-yes'
      });
    });

    it('Convert simple selection for two contests', () => {
      var xml = readFile('./cvrs/sample1.xml');

      const result = NistConverter.nistCvrToAvCvr(xml);

      expect(result['1']).to.eq('option1');
      expect(result['2']).to.eq('optiona');
    });

    it('No contests throws an error', async () => {
      var xml = readFile('./cvrs/no_contests.xml');

      await expectError(
        () => NistConverter.nistCvrToAvCvr(xml),
        Error,
        'No CVRContest found'
      );
    });

    it('No contest selection throws an error', async () => {
      var xml = readFile('./cvrs/no_contest_selection.xml');

      await expectError(
        () => NistConverter.nistCvrToAvCvr(xml),
        Error,
        'No CVRContestSelection found'
      );
    });

    it('Extracts correct snapshot', () => {
      var xml = readFile('./cvrs/sample2.xml');

      const result = NistConverter.nistCvrToAvCvr(xml);

      expect(result['1']).to.eq('option2');
      expect(result['2']).to.eq('optionb');
    });
  });
});
