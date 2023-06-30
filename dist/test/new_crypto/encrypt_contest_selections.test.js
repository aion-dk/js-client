"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var encrypt_contest_selections_1 = require("../../lib/av_client/new_crypto/encrypt_contest_selections");
var encryptionKey = '021edaa87d7626dbd2faa99c4dc080f443c150ab70b24da411b13aa56249b5242e';
var contestOne = {
    address: '',
    author: '',
    parentAddress: '',
    previousAddress: '',
    registeredAt: '',
    signature: '',
    type: 'ContestConfigItem',
    content: {
        reference: 'contest-1',
        markingType: {
            minMarks: 1,
            maxMarks: 1,
            blankSubmission: "disabled",
            encoding: {
                codeSize: 1,
                maxSize: 1,
                cryptogramCount: 1
            }
        },
        resultType: {
            name: 'does not matter right now'
        },
        title: { en: 'Contest 1' },
        subtitle: { en: 'Contest 1' },
        description: { en: 'Contest 1' },
        options: [
            {
                reference: 'option-1',
                code: 1,
                title: { en: 'Option 1' },
                subtitle: { en: 'Option 1' },
                description: { en: 'Option 1' },
            }
        ]
    }
};
var contestConfigs = (_a = {},
    _a[contestOne.content.reference] = contestOne,
    _a);
var contestSelections = [
    {
        reference: 'contest-1',
        piles: [{
                multiplier: 1,
                optionSelections: [
                    { reference: 'option-1' }
                ]
            }]
    }
];
describe('encryptContestSelections', function () {
    context('when given a valid contest selection', function () {
        it('returns an array of contest envelopes', function () {
            var contestEnvelopes = (0, encrypt_contest_selections_1.encryptContestSelections)(contestConfigs, contestSelections, encryptionKey);
            (0, chai_1.expect)(contestEnvelopes.length).to.eql(1);
            var contestEnvelope = contestEnvelopes[0];
            (0, chai_1.expect)(contestEnvelope.reference).to.eql('contest-1');
            (0, chai_1.expect)(contestEnvelope).to.have.all.keys('reference', 'piles');
            (0, chai_1.expect)(contestEnvelope.piles[0].cryptograms.length).to.eql(1);
            (0, chai_1.expect)(contestEnvelope.piles[0].randomizers.length).to.eql(1);
        });
    });
    context('when given a contest selection for a contest that uses 2 cryptograms', function () {
        var _a;
        var bigContest = {
            address: '',
            author: '',
            parentAddress: '',
            previousAddress: '',
            registeredAt: '',
            signature: '',
            type: 'ContestConfigItem',
            content: {
                reference: 'big-contest',
                markingType: {
                    minMarks: 1,
                    maxMarks: 1,
                    blankSubmission: "disabled",
                    encoding: {
                        codeSize: 1,
                        maxSize: 41,
                        cryptogramCount: 2
                    }
                },
                resultType: {
                    name: 'does not matter right now'
                },
                title: { en: 'Contest 1' },
                subtitle: { en: 'Contest 1' },
                description: { en: 'Contest 1' },
                options: [
                    {
                        reference: 'option-1',
                        code: 1,
                        title: { en: 'Option 1' },
                        subtitle: { en: 'Option 1' },
                        description: { en: 'Option 1' },
                        writeIn: {
                            maxSize: 40,
                            encoding: 'utf8'
                        }
                    }
                ]
            }
        };
        var contestConfigs = (_a = {},
            _a[bigContest.content.reference] = bigContest,
            _a);
        var contestSelections = [
            {
                reference: 'big-contest',
                piles: [{
                        multiplier: 1,
                        optionSelections: [
                            { reference: 'option-1', text: 'this is a write in text' }
                        ]
                    }]
            }
        ];
        it('returns an array of one contest envelope that contains 2 cryptograms and 2 randomizers', function () {
            var contestEnvelopes = (0, encrypt_contest_selections_1.encryptContestSelections)(contestConfigs, contestSelections, encryptionKey);
            (0, chai_1.expect)(contestEnvelopes.length).to.eql(1);
            var contestEnvelope = contestEnvelopes[0];
            (0, chai_1.expect)(contestEnvelope.reference).to.eql('big-contest');
            (0, chai_1.expect)(contestEnvelope.piles[0].cryptograms.length).to.eql(2);
            (0, chai_1.expect)(contestEnvelope.piles[0].randomizers.length).to.eql(2);
        });
    });
});
//# sourceMappingURL=encrypt_contest_selections.test.js.map