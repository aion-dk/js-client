"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var byte_encoding_1 = require("../../lib/av_client/encoding/byte_encoding");
var chai_1 = require("chai");
var contestConfig = {
    address: '',
    author: '',
    parentAddress: '',
    previousAddress: '',
    registeredAt: '',
    signature: '',
    type: 'ContestConfigItem',
    content: {
        reference: 'contest ref 1',
        title: { en: 'Contest title' },
        subtitle: { en: '' },
        description: { en: '' },
        markingType: {
            minMarks: 1,
            maxMarks: 3,
            blankSubmission: "disabled",
            encoding: {
                codeSize: 1,
                maxSize: 20,
                cryptogramCount: 1
            }
        },
        resultType: {
            name: 'does not matter for this test'
        },
        options: [
            {
                reference: 'ref1',
                code: 1,
                title: { en: 'Option 1' },
                subtitle: { en: '' },
                description: { en: '' }
            },
            {
                reference: 'ref2',
                code: 2,
                title: { en: 'Option 2' },
                subtitle: { en: '' },
                description: { en: '' }
            },
            {
                reference: 'ref3',
                code: 3,
                title: { en: 'Option 3 write in' },
                subtitle: { en: '' },
                description: { en: '' },
                writeIn: {
                    maxSize: 10,
                    encoding: 'utf8'
                }
            }
        ]
    }
};
describe('contestSelectionToByteArray', function () {
    it('returns a Uint8Array when given a ContestSelection', function () {
        var selectionPile = {
            multiplier: 1,
            optionSelections: [
                { reference: 'ref2' },
                { reference: 'ref3', text: 'hello' },
                { reference: 'ref1' }
            ]
        };
        (0, chai_1.expect)((0, byte_encoding_1.selectionPileToByteArray)(contestConfig, selectionPile).toString()).to.eq('2,3,104,101,108,108,111,0,0,0,0,0,1,0,0,0,0,0,0,0');
    });
    context('when selections are blank', function () {
        var selectionPile = {
            multiplier: 1,
            optionSelections: []
        };
        it('return a null-only byte array', function () {
            (0, chai_1.expect)((0, byte_encoding_1.selectionPileToByteArray)(contestConfig, selectionPile).toString()).to.eq('0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0');
        });
    });
});
describe('byteArrayToContestSelection', function () {
    var byteArray = Uint8Array.of(2, 3, 104, 101, 108, 108, 111, 0, 0, 0, 0, 0, 1);
    var selectionPile = {
        multiplier: 1,
        optionSelections: [
            { reference: 'ref2' },
            { reference: 'ref3', text: 'hello' },
            { reference: 'ref1' }
        ]
    };
    it('returns a ContestSelection when given a valid Uint8Array', function () {
        var result = (0, byte_encoding_1.byteArrayToSelectionPile)(contestConfig, byteArray, selectionPile.multiplier);
        (0, chai_1.expect)(result).to.deep.equal(selectionPile);
    });
    context('when byte array contains padding', function () {
        var byteArray = Uint8Array.of(2, 3, 104, 101, 108, 108, 111, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        it('returns a ContestSelection when given a valid Uint8Array', function () {
            var result = (0, byte_encoding_1.byteArrayToSelectionPile)(contestConfig, byteArray, selectionPile.multiplier);
            (0, chai_1.expect)(result).to.deep.equal(selectionPile);
        });
    });
    context('when byte array contains an unexpected code', function () {
        it('throws an error', function () {
            var byteArray = Uint8Array.of(42);
            (0, chai_1.expect)(function () {
                (0, byte_encoding_1.byteArrayToSelectionPile)(contestConfig, byteArray, selectionPile.multiplier);
            }).to.throw('ArgumentError: Unexpected option code encountered');
        });
    });
});
//# sourceMappingURL=byte_encoding.test.js.map