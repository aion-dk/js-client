"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var uniformer_1 = require("../lib/util/uniformer");
describe('Uniformer', function () {
    context('when object is a Hash', function () {
        it('(deep) sorts hashes by keys and converts keys to string', function () {
            var unsortedProperties = {
                b: 2,
                a: 1,
                c: {
                    c3: 'c',
                    c2: 'b',
                    c1: 'a'
                }
            };
            var result = new uniformer_1.Uniformer().formString(unsortedProperties);
            (0, chai_1.expect)(result).to.equal(JSON.stringify([
                ['a', 1],
                ['b', 2],
                ['c', [
                        ['c1', 'a'],
                        ['c2', 'b'],
                        ['c3', 'c']
                    ]
                ]
            ]));
        });
        it('sorts hashes by utf8 bytes of the string keys', function () {
            var unsortedProperties = {
                "a": 1,
                "A": 1,
                'z': 1,
                'Z': 1,
                'æ': 1,
                'Æ': 1
            };
            var result = new uniformer_1.Uniformer().formString(unsortedProperties);
            (0, chai_1.expect)(result).to.equal(JSON.stringify([["A", 1], ["Z", 1], ["a", 1], ["z", 1], ["Æ", 1], ["æ", 1]]));
        });
    });
    context('when object is a Symbol', function () {
        it('converts symbol values to strings', function () {
            var input1 = { test: Symbol('foobar') };
            var input2 = { test: Symbol.for('foobar') };
            (0, chai_1.expect)(new uniformer_1.Uniformer().formString(input1))
                .to.equal(JSON.stringify([['test', 'foobar']]));
            (0, chai_1.expect)(new uniformer_1.Uniformer().formString(input2))
                .to.equal(JSON.stringify([['test', 'foobar']]));
        });
    });
    context('when object is a DateTime', function () {
        it('converts to a string in ISO8601 UTC using milliseconds', function () {
            var someDate = new Date("2020-06-08T23:59:30.849+0200");
            (0, chai_1.expect)(new uniformer_1.Uniformer().formString(someDate))
                .to.equal(JSON.stringify('2020-06-08T21:59:30.849Z'));
        });
    });
    it('allows integers, booleans and null', function () {
        var uniformer = new uniformer_1.Uniformer();
        var values = [42, -1, true, false, null];
        values.forEach(function (value) {
            (0, chai_1.expect)(uniformer.formString(value))
                .to.equal(JSON.stringify(value));
        });
    });
    context('when object is an Array', function () {
        it('allows arrays', function () {
            var input = ['1', 2, 3];
            (0, chai_1.expect)(new uniformer_1.Uniformer().formString(input))
                .to.equal('["1",2,3]');
        });
    });
    it('applies rules to nested objects', function () {
        var input = {
            string: 'a string',
            array: [
                new Date('2000-01-01T00:00:00+0100'),
                { date: new Date('2000-01-01T00:00:00+0500') },
                Symbol('test'),
                true,
            ],
            hash: { '2': 'two', '1': Symbol('one') },
        };
        (0, chai_1.expect)(new uniformer_1.Uniformer().formString(input)).to.equal(JSON.stringify([
            ['array', [
                    '1999-12-31T23:00:00.000Z',
                    [['date', '1999-12-31T19:00:00.000Z']],
                    'test',
                    true
                ]],
            ['hash', [['1', 'one'], ['2', 'two']]],
            ['string', 'a string']
        ]));
    });
});
//# sourceMappingURL=uniformer.test.js.map