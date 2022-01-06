import { expect } from 'chai';
import Uniformer from '../lib/util/uniformer';

describe('Uniformer', () => {
  context('when object is a Hash', () => {
    it.only('(deep) sorts hashes by keys and converts keys to string', async () => {
      const unsortedProperties = {
        b: 2,
        a: 1,
        c: {
          c3: 'c',
          c2: 'b',
          c1: 'a'
        }
      };

      const result = new Uniformer().formString(unsortedProperties);
      expect(result).to.equal(JSON.stringify({
        a: 1,
        b: 2,
        c: {
          c1: 'a',
          c2: 'b',
          c3: 'c'
        }
      }));
    })
  });
});
