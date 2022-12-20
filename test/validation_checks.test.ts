import { validatePayload, validateReceipt } from '../lib/av_client/sign';
import { ItemExpectation, BoardItem } from '../lib/av_client/types';
import { expect } from 'chai';

describe('Validation checks', () => {
  context('validatePayload', () => {
    const expectedItem: ItemExpectation = {
      parentAddress: "12345",
      content: {
        commitment: "commitmentstring"
      },
      type: "BoardEncryptionCommitmentItem",
    }

    const receivedItem: BoardItem = {
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
    }

    const expectedSessionItem: ItemExpectation = {
      parentAddress: "12345",
      content: {
        authToken: "123",
        identifier: "identifier",
        voterGroup: "group1",
        publicKey: "12345",
        votingRoundReference: "round1",
      },
      type: "VoterSessionItem",
    }

    const receivedSessionItem: BoardItem = {
      address: "33e486117e7255861e15a31781d494700d68ed35e41e6ebcb0926ce5b3c828fb",
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
        votingRoundReference: "round1",
        segments: { "age": "10-20"}
      },
      type: "VoterSessionItem",
    }

    it("Session payload is correct", () => {
      expect(() => validatePayload(receivedSessionItem, expectedSessionItem)).not.to.throw();
    });

    it("Payload is correct", () => {
      expect(() => validatePayload(receivedItem, expectedItem)).not.to.throw();
    });

    it("Type doesn't match", () => {
      const wrongType:ItemExpectation = { ...expectedItem, type: "VoterEncryptionCommitmentItem" };
      expect(() => validatePayload(receivedItem, wrongType)).to.throw("BoardItem did not match expected type");
    });

    it("Parent address doesn't match", () => {
      const wrongAddress:ItemExpectation = { ...expectedItem, parentAddress: "67890" };
      expect(() => validatePayload(receivedItem, wrongAddress)).to.throw("BoardItem did not match expected parent address");
    });

    it("Content/address doesn't match", () => {
      const wrongContent:ItemExpectation = { ...expectedItem, content: { cryptograms: "cryptostuff" } };
      expect(() => validatePayload(receivedItem, wrongContent)).to.throw("Item payload failed sanity check");
    });

    it("Signature doesn't match", () => {
      const signature = "something,somethingelse";
      expect(() => validatePayload(receivedItem, expectedItem, signature)).to.throw("invalid number of arguments in encoding");
    });
  });

  context('validateReceipt', () => {
    const publicKey = 'c459c2064e36420e54c799fb8801b63e470d8e6e683b985906b4a1bac39311a4';
    // const privateKey = '02049ff8df4763cd2a85bfcd3a1bfde12ec8dc863509646556d922944ef4e870dc';

    const item: BoardItem = {
      address: "bfaef009311cd6d6f36acb31db1f44468b8f2ef23d606b7ca7331e9fb3b1e4fa",
      author: "",
      parentAddress: "a7335b96f2f7451a4cfe910efef4bc4a2b56e044682b926a6c94da6c36880ff8",
      previousAddress: "cf505643b1aa9c6ca7d055b0ec53f6f0403489e1ddfb1e3f532fb23bce9ea675",
      content: {
        authToken: "",
        identifier: "",
        voterGroup: "",
        publicKey: publicKey,
        votingRoundReference: ""
      },
      registeredAt: "",
      signature: "71b8d5d9565d7a174cc2938b1a591281538bbbd913032ff87f7d92071e01f335,70cef6d1f4d1ef06f5a1a207c70dcd936a2c6fb508361e61cf4c77aa1175319d",
      type: "VoterSessionItem"
    }

    const items: BoardItem[] = [
      item,
      {
        address: "cf505643b1aa9c6ca7d055b0ec53f6f0403489e1ddfb1e3f532fb23bce9ea675",
        author: "",
        parentAddress: "413f31e24314bfad618cd5f09f999384f188360e316cfb0b9f36218358fd092b",
        previousAddress: "413f31e24314bfad618cd5f09f999384f188360e316cfb0b9f36218358fd092b",
        content: {
          cryptograms: {
            recqPa7AeyufIfd6k: [""]
          }
        },
        registeredAt: "",
        signature: "808fa2bea0fb49e54d59fa4197f35d7b5bf994400faf12874e470265b3c3ed54,8470b60b1ffed79a034daeaec4eeda8ac798c6e89a0ed25a6c498ee337259f3a",
        type: "BallotCryptogramsItem"
      },
    ];

    it("Receipt is valid", () => {
      const receipt = "2b68859d219385f1913f0f3570f21ce6816237041bccc64e58eba6b268d8c98c,de749a195554ef256dcb9556cb86a4708b05bc229bed2c6522efdf3fdbe53f83";
      expect(() => validateReceipt(items, receipt, publicKey)).to.not.throw;
    });

    it("Signature has wrong number of arguments", () => {
      const receipt = "something";
      expect(() => validateReceipt(items, receipt, publicKey)).to.throw("invalid number of arguments in encoding, SchnorrSignature");
    });

    it("Receipt is invalid", () => {
      const receipt = "71b8d5d9565d7a174cc2938b1a591281538bbbd913032ff87f7d92071e01f335,70cef6d1f4d1ef06f5a1a207c70dcd936a2c6fb508361e61cf4c77aa1175319d";
      expect(() => validateReceipt(items, receipt, publicKey)).to.throw("not on the curve!");
    });
  });
});
