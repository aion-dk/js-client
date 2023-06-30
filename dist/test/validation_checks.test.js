"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var sign_1 = require("../lib/av_client/sign");
var chai_1 = require("chai");
describe('Validation checks', function () {
    context('validatePayload', function () {
        var expectedItem = {
            parentAddress: "12345",
            content: {
                commitment: "commitmentstring"
            },
            type: "BoardEncryptionCommitmentItem",
        };
        var receivedItem = {
            address: "6ba688ab06cab4e1c890d298dd672d445a32c078f2fa32c6a988ba236770cf36",
            author: "",
            parentAddress: "12345",
            previousAddress: "11111",
            registeredAt: "",
            signature: "",
            content: {
                commitment: "commitmentstring"
            },
            type: "BoardEncryptionCommitmentItem",
        };
        var expectedSessionItem = {
            parentAddress: "12345",
            content: {
                authToken: "123",
                identifier: "identifier",
                voterGroup: "group1",
                weight: 1,
                publicKey: "12345",
                votingRoundReference: "round1",
            },
            type: "VoterSessionItem",
        };
        var receivedSessionItem = {
            address: "ba7520c37f9a81a5eee305dda9183799acea93f05a832a0016ae4e6659411ca4",
            author: "",
            parentAddress: "12345",
            previousAddress: "11111",
            registeredAt: "",
            signature: "",
            content: {
                authToken: "123",
                identifier: "identifier",
                voterGroup: "group1",
                publicKey: "12345",
                weight: 1,
                votingRoundReference: "round1",
                segments: { "age": "10-20" }
            },
            type: "VoterSessionItem",
        };
        it("Session payload is correct", function () {
            (0, chai_1.expect)(function () { return (0, sign_1.validatePayload)(receivedSessionItem, expectedSessionItem); }).not.to.throw();
        });
        it("Payload is correct", function () {
            (0, chai_1.expect)(function () { return (0, sign_1.validatePayload)(receivedItem, expectedItem); }).not.to.throw();
        });
        it("Type doesn't match", function () {
            var wrongType = __assign(__assign({}, expectedItem), { type: "VoterEncryptionCommitmentItem" });
            (0, chai_1.expect)(function () { return (0, sign_1.validatePayload)(receivedItem, wrongType); }).to.throw("BoardItem did not match expected type");
        });
        it("Parent address doesn't match", function () {
            var wrongAddress = __assign(__assign({}, expectedItem), { parentAddress: "67890" });
            (0, chai_1.expect)(function () { return (0, sign_1.validatePayload)(receivedItem, wrongAddress); }).to.throw("BoardItem did not match expected parent address");
        });
        it("Content/address doesn't match", function () {
            var wrongContent = __assign(__assign({}, expectedItem), { content: { cryptograms: "cryptostuff" } });
            (0, chai_1.expect)(function () { return (0, sign_1.validatePayload)(receivedItem, wrongContent); }).to.throw("Item payload failed sanity check");
        });
        it("Signature doesn't match", function () {
            var signature = "something,somethingelse";
            (0, chai_1.expect)(function () { return (0, sign_1.validatePayload)(receivedItem, expectedItem, signature); }).to.throw("invalid number of arguments in encoding");
        });
    });
    context('validateReceipt', function () {
        var publicKey = 'c459c2064e36420e54c799fb8801b63e470d8e6e683b985906b4a1bac39311a4';
        // const privateKey = '02049ff8df4763cd2a85bfcd3a1bfde12ec8dc863509646556d922944ef4e870dc';
        var item = {
            address: "bfaef009311cd6d6f36acb31db1f44468b8f2ef23d606b7ca7331e9fb3b1e4fa",
            author: "",
            parentAddress: "a7335b96f2f7451a4cfe910efef4bc4a2b56e044682b926a6c94da6c36880ff8",
            previousAddress: "cf505643b1aa9c6ca7d055b0ec53f6f0403489e1ddfb1e3f532fb23bce9ea675",
            content: {
                authToken: "",
                identifier: "",
                voterGroup: "",
                weight: 1,
                publicKey: publicKey,
                votingRoundReference: ""
            },
            registeredAt: "",
            signature: "71b8d5d9565d7a174cc2938b1a591281538bbbd913032ff87f7d92071e01f335,70cef6d1f4d1ef06f5a1a207c70dcd936a2c6fb508361e61cf4c77aa1175319d",
            type: "VoterSessionItem"
        };
        var items = [
            item,
            {
                address: "cf505643b1aa9c6ca7d055b0ec53f6f0403489e1ddfb1e3f532fb23bce9ea675",
                author: "",
                parentAddress: "413f31e24314bfad618cd5f09f999384f188360e316cfb0b9f36218358fd092b",
                previousAddress: "413f31e24314bfad618cd5f09f999384f188360e316cfb0b9f36218358fd092b",
                content: {
                    contests: {
                        recqPa7AeyufIfd6k: [{
                                multiplier: 1,
                                cryptograms: [""],
                            }]
                    }
                },
                registeredAt: "",
                signature: "808fa2bea0fb49e54d59fa4197f35d7b5bf994400faf12874e470265b3c3ed54,8470b60b1ffed79a034daeaec4eeda8ac798c6e89a0ed25a6c498ee337259f3a",
                type: "BallotCryptogramsItem"
            },
        ];
        it("Receipt is valid", function () {
            var receipt = "2b68859d219385f1913f0f3570f21ce6816237041bccc64e58eba6b268d8c98c,de749a195554ef256dcb9556cb86a4708b05bc229bed2c6522efdf3fdbe53f83";
            (0, chai_1.expect)(function () { return (0, sign_1.validateReceipt)(items, receipt, publicKey); }).to.not.throw;
        });
        it("Signature has wrong number of arguments", function () {
            var receipt = "something";
            (0, chai_1.expect)(function () { return (0, sign_1.validateReceipt)(items, receipt, publicKey); }).to.throw("invalid number of arguments in encoding, SchnorrSignature");
        });
        it("Receipt is invalid", function () {
            var receipt = "71b8d5d9565d7a174cc2938b1a591281538bbbd913032ff87f7d92071e01f335,70cef6d1f4d1ef06f5a1a207c70dcd936a2c6fb508361e61cf4c77aa1175319d";
            (0, chai_1.expect)(function () { return (0, sign_1.validateReceipt)(items, receipt, publicKey); }).to.throw("not on the curve!");
        });
    });
});
//# sourceMappingURL=validation_checks.test.js.map