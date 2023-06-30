"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var commitments_1 = require("../../lib/av_client/new_crypto/commitments");
describe("Pedersen Commitment", function () {
    var messages = {
        "1": [[
                "d70d319fd1c7867af1ca477878d381e4d70d319fd1c7867af1ca477878d381e4",
                "ef5b373b279ed26cf774d7e3376ac549ef5b373b279ed26cf774d7e3376ac549"
            ]],
        "2": [[
                "3c2e2bdcc29734c7e06d53b37cc2724c3c2e2bdcc29734c7e06d53b37cc2724c",
                "000000dcc29734c7e06d53b37cc2724c000000dcc29734c7e06d53b37cc2724c"
            ]]
    };
    describe("generateCommitment()", function () {
        it("generate commitment from single message", function () {
            var result = (0, commitments_1.generateCommitment)(messages);
            (0, chai_1.expect)(result.commitment).to.exist;
            (0, chai_1.expect)(result.randomizer).to.exist;
        });
    });
    describe("validateCommitment()", function () {
        var commitment = "0270d4e11f07fa46f78f729ff41da8ed21a26170431862ca93fd11372e7c7a518e";
        var randomizer = "d253c38e28661dcaf7116a43f0dce6c33c845f5e905c528ff86cad34f1212308";
        var commitmentOpening = {
            randomizers: messages,
            commitmentRandomness: randomizer
        };
        it("validates", function () {
            var result = (0, commitments_1.validateCommitment)(commitmentOpening, commitment);
            (0, chai_1.expect)(result).to.be.undefined;
        });
        context("when wrong commitment", function () {
            var commitment = "0328028ddb8f420c061239339c8fbe7fcbaf9fa02fbd2da797d390a3d524509015";
            it("throws error", function () {
                (0, chai_1.expect)(function () {
                    (0, commitments_1.validateCommitment)(commitmentOpening, commitment);
                }).to.throw('Pedersen commitment not valid');
            });
            context('when given custom error message', function () {
                var message = "hello";
                it("throws a custom error", function () {
                    (0, chai_1.expect)(function () {
                        (0, commitments_1.validateCommitment)(commitmentOpening, commitment, message);
                    }).to.throw(message);
                });
            });
        });
    });
});
//# sourceMappingURL=commitments.test.js.map