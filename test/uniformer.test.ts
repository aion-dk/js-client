import { expect } from 'chai';
import { expectError } from './test_helpers';

import Uniformer from '../lib/util/uniformer';

describe.only('Uniformer', () => {
  context('when object is a Hash', () => {
    it('(deep) sorts hashes by keys and converts keys to string', async () => {
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

      expect(result).to.equal(JSON.stringify([
        ['a', 1],
        ['b', 2],
        ['c', [
            ['c1', 'a'],
            ['c2', 'b'],
            ['c3', 'c']
          ]
        ]
      ]));
    })
  });

  context('when object is a Symbol', () => {
    it('converts symbol values to strings', () => {
      const input1 = { test: Symbol('foobar') };
      const input2 = { test: Symbol.for('foobar') };

      expect(new Uniformer().formString(input1))
        .to.equal(JSON.stringify([[ 'test', 'foobar']]));

      expect(new Uniformer().formString(input2))
        .to.equal(JSON.stringify([[ 'test', 'foobar']]));
    });
  });
});
