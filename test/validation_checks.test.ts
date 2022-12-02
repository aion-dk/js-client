
import { validatePayload } from '../lib/av_client/sign';
import { ItemExpectation, BoardItem } from '../lib/av_client/types';
import { expect } from 'chai';
import * as Crypto from '../lib/av_client/aion_crypto';
import {Uniformer} from '../lib/util/uniformer';

describe.only('Signs', () => {
  context('validatePayload', () => {
    it("Payload is correct", () => {
      const expectedItem: ItemExpectation = {
        parentAddress: "12345",
        content: {
          commitment: "commitmentstring"
        },
        type: "BoardEncryptionCommitmentItem",
      }

      const receivedItem: BoardItem = {
        address: "",
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

      const uniformer = new Uniformer();

      const addressHashSource = uniformer.formString({
        type: receivedItem.type,
        content: receivedItem.content,
        parentAddress: receivedItem.parentAddress,
        previousAddress: receivedItem.previousAddress,
        registeredAt: receivedItem.registeredAt
      });

      const expectedItemAddress = Crypto.hashString(addressHashSource);

      receivedItem.address = expectedItemAddress;

      expect(() => validatePayload(receivedItem, expectedItem)).not.throw;
    });

    it("Type doesn't match", () => {
      const expectedItem: ItemExpectation = {
        parentAddress: "",
        type: "VoterEncryptionCommitmentItem",
      }

      const receivedItem: BoardItem = {
        address: "",
        author: "",
        parentAddress: "",
        previousAddress: "",
        registeredAt: "",
        signature: "",
        content: {
          commitment: "commitmentstring"
        },
        type: "BoardEncryptionCommitmentItem",
      }

      expect(() => validatePayload(receivedItem, expectedItem)).to.throw("BoardItem did not match expected type");
    });

    it("Parent address doesn't match", () => {
      const expectedItem: ItemExpectation = {
        parentAddress: "12345",
        content: {
          commitment: "commitmentstring"
        },
        type: "BoardEncryptionCommitmentItem",
      }

      const receivedItem: BoardItem = {
        address: "",
        author: "",
        parentAddress: "67890",
        previousAddress: "",
        registeredAt: "",
        signature: "",
        content: {
          commitment: "commitmentstring"
        },
        type: "BoardEncryptionCommitmentItem",
      }

      expect(() => validatePayload(receivedItem, expectedItem)).to.throw("BoardItem did not match expected parent address");
    });

    it("Content/address doesn't match", () => {
      const expectedItem: ItemExpectation = {
        parentAddress: "",
        content: {
          cryptograms: "sdonfmweokfwe"
        },
        type: "BoardEncryptionCommitmentItem",
      }

      const receivedItem: BoardItem = {
        address: "",
        author: "",
        parentAddress: "",
        previousAddress: "",
        registeredAt: "",
        signature: "",
        content: {
          commitment: "commitmentstring"
        },
        type: "BoardEncryptionCommitmentItem",
      }

      expect(() => validatePayload(receivedItem, expectedItem)).to.throw("Item payload failed sanity check");
    });

    it("Signature doesn't match", () => {
      const expectedItem: ItemExpectation = {
        parentAddress: "12345",
        content: {
          commitment: "commitmentstring"
        },
        type: "BoardEncryptionCommitmentItem",
      }

      const receivedItem: BoardItem = {
        address: "",
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

      const uniformer = new Uniformer();

      const addressHashSource = uniformer.formString({
        type: receivedItem.type,
        content: receivedItem.content,
        parentAddress: receivedItem.parentAddress,
        previousAddress: receivedItem.previousAddress,
        registeredAt: receivedItem.registeredAt
      });

      const expectedItemAddress = Crypto.hashString(addressHashSource);
      const signature = "something,something else"

      receivedItem.address = expectedItemAddress;

      expect(() => validatePayload(receivedItem, expectedItem, signature)).to.throw("invalid number of arguments in encoding");
    });
  });
});
