
import { validatePayload, validateReceipt } from '../lib/av_client/sign';
import { ItemExpectation, BoardItem } from '../lib/av_client/types';
import { expect } from 'chai';

describe('Validation checks', () => {
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

      const signature = "something,somethingelse";

      expect(() => validatePayload(receivedItem, expectedItem, signature)).to.throw("invalid number of arguments in encoding");
    });
  });

  context('validateReceipt', () => {
    it("Receipt is valid", () => {

      const items: BoardItem[] = [
        {
          address: "bfaef009311cd6d6f36acb31db1f44468b8f2ef23d606b7ca7331e9fb3b1e4fa",
          author: "Digital Ballot Box",
          parentAddress: "a7335b96f2f7451a4cfe910efef4bc4a2b56e044682b926a6c94da6c36880ff8",
          previousAddress: "cf505643b1aa9c6ca7d055b0ec53f6f0403489e1ddfb1e3f532fb23bce9ea675",
          content: {
            authToken: "eyJhbGciOiJFUzI1NiJ9.eyJpZGVudGlmaWVyIjoiY2U2MDk2NjdjNWYzNzQ1YjUwNWMyMDk4ZGI0OWMxZWFmMGU0MDNhNSIsInB1YmxpY19rZXkiOiIwM2I4N2Q3ZmU3OTNhNjIxZGYyN2Y0NGMyMGY0NjBmZjcxMWQ1NTU0NWM1ODcyOWYyMGIzZmI2ZTg3MWM1M2M0OWMiLCJ2b3Rlcl9ncm91cF9rZXkiOiJwcmVjaW5jdF80X2JlZHJvY2siLCJzZWdtZW50MSI6InByZWNpbmN0XzRfYmVkcm9jayIsImVjX3Rva2VuX2ZpbmdlcnByaW50IjoiYzliNjQ5NDM1MDUyYjNhODNjMmZkMWVkNDMzZmE4YzliMDI1ZTBlMSIsImF1ZCI6ImF2eDowM2QyMzk4Yy0xMTNkLTRmMGQtOTAwZC0zMDUwNWVmYWNmMWIiLCJpYXQiOjE2Njk5NzA3NjQsImV4cCI6MTY2OTk3MjU2NH0.VNB2Um-NM8Etnk1uJ-2DIo5JnA8wMgfU553EU917Gyz8xqyK2KGz7D-kZKYshvhd9Jp7pWmMu_wh0A7GvKjWSQ",
            identifier: "ce609667c5f3745b505c2098db49c1eaf0e403a5",
            voterGroup: "precinct_4_bedrock",
            publicKey: "03a6ba3f82ef21655a136add585d4f1bdef2dad72878589c60a16e08f93852b9ea"
          },
          registeredAt: "2022-12-02T08:46:04.649Z",
          signature: "71b8d5d9565d7a174cc2938b1a591281538bbbd913032ff87f7d92071e01f335,70cef6d1f4d1ef06f5a1a207c70dcd936a2c6fb508361e61cf4c77aa1175319d",
          type: "VoterSessionItem"
        },
        {
          address: "cf505643b1aa9c6ca7d055b0ec53f6f0403489e1ddfb1e3f532fb23bce9ea675",
          author: "voter-afb0bd9e14c4c79e82f01e1ca75db12c5e150ca5",
          parentAddress: "413f31e24314bfad618cd5f09f999384f188360e316cfb0b9f36218358fd092b",
          previousAddress: "413f31e24314bfad618cd5f09f999384f188360e316cfb0b9f36218358fd092b",
          content: {
            cryptograms: {
              recqPa7AeyufIfd6k: [
                "0241ccd4a84692d6166f9352c9167f88d5bd1ab36e708c7b3db80b75045c9d298c,0345b0d0f102024b0955d7854bbe188f8fed4da4f22d312611603b99c49c5dd86a"
              ]
            }
          },
          registeredAt: "2022-12-02T08:46:03.917Z",
          signature: "808fa2bea0fb49e54d59fa4197f35d7b5bf994400faf12874e470265b3c3ed54,8470b60b1ffed79a034daeaec4eeda8ac798c6e89a0ed25a6c498ee337259f3a",
          type: "BallotCryptogramsItem"
        },
      ];

      const receipt = "431c7e8322bc80c5b024cb288a692cd8fb80a970d1c4606c5ab966b437c5b5d4,87faeab0c56af08006eae629dbe58db7fa6ef8082f63e74fdacef76948e036e1";
      const publicKey = "03a6ba3f82ef21655a136add585d4f1bdef2dad72878589c60a16e08f93852b9ea";

      expect(() => validateReceipt(items, receipt, publicKey)).to.not.throw;
    });

    it("Signature has wrong number of arguments", () => {
      const item: BoardItem = {
        address: "bfaef009311cd6d6f36acb31db1f44468b8f2ef23d606b7ca7331e9fb3b1e4fa",
        author: "Digital Ballot Box",
        parentAddress: "a7335b96f2f7451a4cfe910efef4bc4a2b56e044682b926a6c94da6c36880ff8",
        previousAddress: "cf505643b1aa9c6ca7d055b0ec53f6f0403489e1ddfb1e3f532fb23bce9ea675",
        content: {
          authToken: "eyJhbGciOiJFUzI1NiJ9.eyJpZGVudGlmaWVyIjoiY2U2MDk2NjdjNWYzNzQ1YjUwNWMyMDk4ZGI0OWMxZWFmMGU0MDNhNSIsInB1YmxpY19rZXkiOiIwM2I4N2Q3ZmU3OTNhNjIxZGYyN2Y0NGMyMGY0NjBmZjcxMWQ1NTU0NWM1ODcyOWYyMGIzZmI2ZTg3MWM1M2M0OWMiLCJ2b3Rlcl9ncm91cF9rZXkiOiJwcmVjaW5jdF80X2JlZHJvY2siLCJzZWdtZW50MSI6InByZWNpbmN0XzRfYmVkcm9jayIsImVjX3Rva2VuX2ZpbmdlcnByaW50IjoiYzliNjQ5NDM1MDUyYjNhODNjMmZkMWVkNDMzZmE4YzliMDI1ZTBlMSIsImF1ZCI6ImF2eDowM2QyMzk4Yy0xMTNkLTRmMGQtOTAwZC0zMDUwNWVmYWNmMWIiLCJpYXQiOjE2Njk5NzA3NjQsImV4cCI6MTY2OTk3MjU2NH0.VNB2Um-NM8Etnk1uJ-2DIo5JnA8wMgfU553EU917Gyz8xqyK2KGz7D-kZKYshvhd9Jp7pWmMu_wh0A7GvKjWSQ",
          identifier: "ce609667c5f3745b505c2098db49c1eaf0e403a5",
          voterGroup: "precinct_4_bedrock",
          publicKey: "03b87d7fe793a621df27f44c20f460ff711d55545c58729f20b3fb6e871c53c49c"
        },
        registeredAt: "2022-12-02T08:46:04.649Z",
        signature: "71b8d5d9565d7a174cc2938b1a591281538bbbd913032ff87f7d92071e01f335,70cef6d1f4d1ef06f5a1a207c70dcd936a2c6fb508361e61cf4c77aa1175319d",
        type: "VoterSessionItem"
      }

      const items: BoardItem[] = [item];

      const receipt = "something";
      const publicKey = "03b87d7fe793a621df27f44c20f460ff711d55545c58729f20b3fb6e871c53c49c";

      expect(() => validateReceipt(items, receipt, publicKey)).to.throw("invalid number of arguments in encoding, SchnorrSignature");
    });

    it("Receipt is invalid", () => {
      const item: BoardItem = {
        address: "bfaef009311cd6d6f36acb31db1f44468b8f2ef23d606b7ca7331e9fb3b1e4fa",
        author: "Digital Ballot Box",
        parentAddress: "a7335b96f2f7451a4cfe910efef4bc4a2b56e044682b926a6c94da6c36880ff8",
        previousAddress: "cf505643b1aa9c6ca7d055b0ec53f6f0403489e1ddfb1e3f532fb23bce9ea675",
        content: {
          authToken: "eyJhbGciOiJFUzI1NiJ9.eyJpZGVudGlmaWVyIjoiY2U2MDk2NjdjNWYzNzQ1YjUwNWMyMDk4ZGI0OWMxZWFmMGU0MDNhNSIsInB1YmxpY19rZXkiOiIwM2I4N2Q3ZmU3OTNhNjIxZGYyN2Y0NGMyMGY0NjBmZjcxMWQ1NTU0NWM1ODcyOWYyMGIzZmI2ZTg3MWM1M2M0OWMiLCJ2b3Rlcl9ncm91cF9rZXkiOiJwcmVjaW5jdF80X2JlZHJvY2siLCJzZWdtZW50MSI6InByZWNpbmN0XzRfYmVkcm9jayIsImVjX3Rva2VuX2ZpbmdlcnByaW50IjoiYzliNjQ5NDM1MDUyYjNhODNjMmZkMWVkNDMzZmE4YzliMDI1ZTBlMSIsImF1ZCI6ImF2eDowM2QyMzk4Yy0xMTNkLTRmMGQtOTAwZC0zMDUwNWVmYWNmMWIiLCJpYXQiOjE2Njk5NzA3NjQsImV4cCI6MTY2OTk3MjU2NH0.VNB2Um-NM8Etnk1uJ-2DIo5JnA8wMgfU553EU917Gyz8xqyK2KGz7D-kZKYshvhd9Jp7pWmMu_wh0A7GvKjWSQ",
          identifier: "ce609667c5f3745b505c2098db49c1eaf0e403a5",
          voterGroup: "precinct_4_bedrock",
          publicKey: "03b87d7fe793a621df27f44c20f460ff711d55545c58729f20b3fb6e871c53c49c"
        },
        registeredAt: "2022-12-02T08:46:04.649Z",
        signature: "71b8d5d9565d7a174cc2938b1a591281538bbbd913032ff87f7d92071e01f335,70cef6d1f4d1ef06f5a1a207c70dcd936a2c6fb508361e61cf4c77aa1175319d",
        type: "VoterSessionItem"
      }

      const items: BoardItem[] = [item];

      const receipt = "71b8d5d9565d7a174cc2938b1a591281538bbbd913032ff87f7d92071e01f335,70cef6d1f4d1ef06f5a1a207c70dcd936a2c6fb508361e61cf4c77aa1175319d";
      const publicKey = "03b87d7fe793a621df27f44c20f460ff711d55545c58729f20b3fb6e871c53c49c";

      expect(() => validateReceipt(items, receipt, publicKey)).to.throw("Board receipt verification failed");
    });
  });
});
