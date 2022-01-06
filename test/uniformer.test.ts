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

  context('when object is a DateTime', () => {
    it('converts to a string in ISO8601 UTC using milliseconds', () => {
      const someDate = new Date("2020-06-08T23:59:30.849+0200");

      const withDate = { time: someDate };

      expect(new Uniformer().formString(withDate))
        .to.equal(JSON.stringify([[ 'time', '2020-06-08T21:59:30.849Z']]));
    });
  });


  it('allows integers, booleans and null', () => {
    const uniformer = new Uniformer();

    const values = [42, -1, true, false, null];
    values.forEach((value) => {
      expect(new Uniformer().formString(value))
        .to.equal(JSON.stringify(value));
    })
  });
});
