import { expect } from 'chai';
import {Uniformer} from '../lib/util/uniformer';

describe('Uniformer', () => {
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

      expect(new Uniformer().formString(someDate))
        .to.equal(JSON.stringify('2020-06-08T21:59:30.849Z'));
    });
  });

  it('allows integers, booleans and null', () => {
    const uniformer = new Uniformer();

    const values = [42, -1, true, false, null];
    values.forEach((value) => {
      expect(uniformer.formString(value))
        .to.equal(JSON.stringify(value));
    })
  });

  context('when object is an Array', () => {
    it('allows arrays', () => {
      const input = ['1', 2, 3];

      expect(new Uniformer().formString(input))
        .to.equal('["1",2,3]');
    });
  });

  it('applies rules to nested objects', () => {
    const input = {
      string: 'a string',
      array: [
        new Date('2000-01-01T00:00:00+0100'),
        { date: new Date('2000-01-01T00:00:00+0500') },
        Symbol('test'),
        true,
      ],
      hash: {  '2': 'two', '1': Symbol('one') },
    }

    expect(new Uniformer().formString(input)).to.equal(
      JSON.stringify([
        ['array', [
          '1999-12-31T23:00:00.000Z',
          [[ 'date', '1999-12-31T19:00:00.000Z']],
          'test',
          true
        ]],
        ['hash', [['1', 'one'], ['2', 'two']]],
        ['string', 'a string']
      ]
    ));
  });
});
