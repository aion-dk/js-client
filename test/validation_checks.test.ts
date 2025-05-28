import {signPayload, validatePayload, validateReceipt} from '../lib/av_client/new_crypto/signing';
import {pattern as signaturePattern} from '../lib/av_crypto/schnorr/signature'
import { ItemExpectation, BoardItem } from '../lib/av_client/types';
import { expect } from 'chai';
import {AVCrypto} from "../lib/av_crypto";

describe('Validation checks', () => {
  const crypto = new AVCrypto("secp256k1")

  context('signPayload', () => {
    const item = {
      parentAddress: "parent address",
      type: "type",
      content: {
        key: "value"
      }
    }

    const privateKey = 'c459c2064e36420e54c799fb8801b63e470d8e6e683b985906b4a1bac39311a4';
    it("adds a signature", () => {
      const signedPayload = signPayload(crypto, item, privateKey)

      expect(signedPayload).to.include.all.keys("signature");
      expect(signedPayload.signature).to.match(signaturePattern(crypto.curve))
    });
  })

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
        weight: 1,
        publicKey: "12345",
        votingRoundReference: "round1",
      },
      type: "VoterSessionItem",
    }

    const receivedSessionItem: BoardItem = {
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
    }

    it("Session payload is correct", () => {
      expect(() => validatePayload(crypto, receivedSessionItem, expectedSessionItem)).not.to.throw();
    });

    it("Payload is correct", () => {
      expect(() => validatePayload(crypto, receivedItem, expectedItem)).not.to.throw();
    });

    it("Type doesn't match", () => {
      const wrongType:ItemExpectation = { ...expectedItem, type: "VoterEncryptionCommitmentItem" };
      expect(() => validatePayload(crypto, receivedItem, wrongType)).to.throw("BoardItem did not match expected type");
    });

    it("Parent address doesn't match", () => {
      const wrongAddress:ItemExpectation = { ...expectedItem, parentAddress: "67890" };
      expect(() => validatePayload(crypto, receivedItem, wrongAddress)).to.throw("BoardItem did not match expected parent address");
    });

    it("Content/address doesn't match", () => {
      const wrongContent:ItemExpectation = { ...expectedItem, content: { cryptograms: "cryptostuff" } };
      expect(() => validatePayload(crypto, receivedItem, wrongContent)).to.throw("Item payload failed sanity check");
    });

    it("Signature doesn't match", () => {
      const signature = "something,somethingelse";
      expect(() => validatePayload(crypto, receivedItem, expectedItem, signature)).to.throw("input must match ^(([a-f0-9]{64}),([a-f0-9]{64}))$");
    });
  });

  context('validateReceipt', () => {
    // const privateKey = 'c459c2064e36420e54c799fb8801b63e470d8e6e683b985906b4a1bac39311a4';
    const publicKey = '02049ff8df4763cd2a85bfcd3a1bfde12ec8dc863509646556d922944ef4e870dc';

    const item: BoardItem = {
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
    }

    const items: BoardItem[] = [
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

    it("Receipt is valid", () => {
      const receipt = "84cc25b182c377e22283c0704769fc7453fd51ef84cd40ae899399ee6240965d,092139e51200b6e842c66954bfd1199b8d01d2eece8eabd98b9224c4e717d6b1";
      expect(() => validateReceipt(crypto, items, receipt, publicKey)).to.not.throw();
    });

    it("Signature has wrong number of arguments", () => {
      const receipt = "something";
      expect(() => validateReceipt(crypto, items, receipt, publicKey)).to.throw("input must match ^(([a-f0-9]{64}),([a-f0-9]{64}))$");
    });

    it("Receipt is invalid", () => {
      const receipt = "71b8d5d9565d7a174cc2938b1a591281538bbbd913032ff87f7d92071e01f335,70cef6d1f4d1ef06f5a1a207c70dcd936a2c6fb508361e61cf4c77aa1175319d";
      expect(() => validateReceipt(crypto, items, receipt, publicKey)).to.throw("Board receipt verification failed");
    });
  });
});
