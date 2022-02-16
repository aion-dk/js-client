import { expect } from 'chai';
import Uniformer from '../lib/util/uniformer';
import * as Crypto from '../lib/av_client/aion_crypto';

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
        .to.equal('[\"1\",2,3]');
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

  it.skip('random', () => {
    const sample = {
      parentAddress: '24598ebf2abcc545c6b5e6ca0cd3057ca61aecf90100dfeaf97bfe1adcc13f9c',
      previousAddress: '5dbf737f8cecb4ed60f2e6fcc2e1e42c2c757b29c2904e5b648015ddf2ca6081',
      registeredAt: '2022-02-15T14:29:14.331Z',
      type: 'VoterSessionItem',
      content: {
        authToken: 'eyJhbGciOiJFUzI1NiJ9.eyJpZGVudGlmaWVyIjoiNTc2MDIzNTBkMmM4NDJjNjUyN2M4ZjNhYjAyYjRjYzZhNjJjZTY0YSIsInB1YmxpY19rZXkiOiIwMzg0NzhkNzlhY2YwNDgwOTdmNjc5MTYxYTlhZDA2OTY5MDMwZTBhNDJhYmYxZWZiYTRiODZhOGY2OGM0ZDk2MjUiLCJ2b3Rlcl9ncm91cF9rZXkiOiI0Iiwic2VnbWVudDEiOiI0IiwiZWNfdG9rZW5fZmluZ2VycHJpbnQiOiI5ZTRlYTE1ODVkZGFlZWFhYWQ3NDU2NmIzYjAzNjcwZTk2ODMzZmNmIiwiYXVkIjoiYXZ4OmJjMWIxZWQwLTk0M2UtNDY0Ny1iZmMxLTA2MzNiYTA4YzA1ZSIsImlhdCI6MTY0NDkzNTM1NCwiZXhwIjoxNjQ0OTM3MTU0fQ.D68KykcXvYEcygeag7SNzkAK1hVhvxY1f48TXeZEQkhwAWxeGv4tBrEAsG12skCompmYODfREK3IYAfHGGBW1g',
        identifier: '57602350d2c842c6527c8f3ab02b4cc6a62ce64a',
        publicKey: '038478d79acf048097f679161a9ad06969030e0a42abf1efba4b86a8f68c4d9625',
        segment1: '4',
        segment2: null,
        segment3: null,
        segment4: null,
        segment5: null,
        segment6: null,
        voterGroup: '4'
      }
    };

    const uniformed = new Uniformer().formString(sample);
    //console.log('computed address', Crypto.hashString(uniformed));
  })
});
