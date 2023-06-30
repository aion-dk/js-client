"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var finalize_cryptograms_1 = require("../../lib/av_client/new_crypto/finalize_cryptograms");
var voterEnvelopes = [
    {
        reference: 'big-contest',
        piles: [{
                multiplier: 1,
                cryptograms: [
                    '02d1b46fd169cf713312ed96ca8c77c810991f02a21c14d974e31ff4589141bbb3,03ceaa07c76e81c0ce7988f987b2bca9a969f7195c4f5baad42555c9c964854e4d',
                    '03faef66334c1e25a3ea3137299193723675d1bc7542b1b29bdb08644cbd3656ae,0258aed18f2328d18538b77db38d4ff58e2a877a0b73bfcfdb8b12bc62b9d1d28e'
                ],
                randomizers: [
                    '0723349a9b35ca901cbdebc38b3a270ab5c01a2ddb0ff51e195d40e70086b862',
                    '183f83fd53eff298e336dd275c7ef89698f284018ba8b53e2f11a61935ad4c94'
                ]
            }]
    }
];
var emptyCryptograms = {
    'big-contest': [[
            "032034e4abc90113124c4dfe2e5cb6e39fae03a31a48fff9937b39bef3bf362a16,02b21f6d0137c5c34ac40f4b07bfd03b6e8e43b5defb7991f0acd5b8501c0ca866",
            "0378176eb715d76fdc71547d5117b0dcb028b2b253af3b35b34c17c7d0ab6341a5,03f73d0b25d6ef50d1c410a265705a85030bc715f0c3b0f67795ad1ea4d08aafba",
        ]]
};
describe('finalizeCryptograms', function () {
    it('adds cryptograms together', function () {
        var finalizedCryptograms = (0, finalize_cryptograms_1.finalizeCryptograms)(voterEnvelopes, emptyCryptograms);
        (0, chai_1.expect)(finalizedCryptograms).to.deep.equal({
            'big-contest': [{
                    multiplier: 1,
                    cryptograms: [
                        '02995e9bfe87fcd375717323eeb6c0c5832342266fdd2c10cefff626d30bff92c4,0203a31f71548501955c16f1a756133866b7419921aafcad4d1756f58a5f616c55',
                        '02486067b22601134dd07a92dee56a16bb335cd2ff4512f49348c5d4669aa25e16,03844d69aa79b9e361c4e57135944c86413eb1b3c810d0d84ce029e47c13c6c3ac'
                    ]
                }]
        });
    });
});
//# sourceMappingURL=finalize_cryptograms.test.js.map