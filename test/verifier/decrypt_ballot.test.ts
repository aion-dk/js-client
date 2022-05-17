import { decrypt } from "../../lib/av_client/decrypt_vote";
import { ContestConfigMap } from "../../lib/av_client/types";
import { expect } from 'chai';
const contestConfig : ContestConfigMap = {
  "contest ref 1": {
      "markingType": {
          "style": "regular",
          "codeSize": 1,
          "minMarks": 1,
          "maxMarks": 1
      },
      "options": [
          {
              "reference": "option ref 1",
              "code": 1,
              "title": {
                  "en": "Option 1"
              },
              "subtitle": {
                "en": "das"
              },
              "description": {
                "en": "das"
              }
          },
          {
              "reference": "option ref 2",
              "code": 2,
              "title": {
                  "en": "Option 2"
              },
              "subtitle": {
                "en": "das"
              },
              "description": {
                "en": "das"
              }
          }
      ],
      "title": {
          "en": "First ballot"
      },
      "resultType": {
          "name": "resultType name not matter right now"
      },
      "description": {
        "en": "das"
      },
      "subtitle": {
        "en": "das"
      },
  },
}

const encryptionKey = "0372b49c0bc9a853da44eae043c32bf66045bc74cc77f7dcf3edc62d68fd087932"
const cryptograms = {
  "contest ref 1": [
      "03c619ae7011fe86d6d60ef9ee8651fb9cca959d357c4a9f3bda62b42cf547ce6d,0309179f6e8526910ca3eb966be8c457a20a7d96181ac8ea9b5e14f8b8b37bd1fd"
  ]
}
const boardCommitmentOpening = {
  "commitmentRandomness": "a3f2276d06c22ec4bd952b5c7fc1b796f6cbc22054e313b20a78528234eabd12",
  "randomizers": {
      "contest ref 1": [
          "63aa3b0dc7ef1749ea83c96394f61677887582317a56e0059bd7a1ad32a16b37"
      ]
  }
}

const voterCommitmentOpening = {
  "commitmentRandomness": "1a5a254847cd98ab07f8db9b08044db501c0ce9b03c1e9123a3ffcc36baae04d",
  "randomizers": {
      "contest ref 1": [
          "938b61e64673c2e289454a324e4a28622d577bf50498dc787883cb5aafdea025"
      ]
  }
}

const defaultMarkingType = {
  style: "regular",
  codeSize: 1,
  minMarks: 1,
  maxMarks: 1
}


describe('decryptBallot', () => {
  context('given valid CVR', () => {
    it('decrypts a ballot', async () => {
      const decryptedBallot = decrypt(
        contestConfig,
        defaultMarkingType,
        encryptionKey,
        cryptograms,
        boardCommitmentOpening,
        voterCommitmentOpening
      )
      
      expect(decryptedBallot).to.eql({ 'contest ref 1': 'option ref 1' })
    });    
  });

  context('given incorrect encryption key', () => {
    it('throws error', async () => {
      expect(() => decrypt(
        contestConfig,
        defaultMarkingType,
        "0372b49c0bc9a853da44eae043c32bf66045bc74cc77f7dcf3edc62d68fd087944", // Incorrect
        cryptograms,
        boardCommitmentOpening,
        voterCommitmentOpening
      )).to.throw("not on the curve!")
    });    
  });

  context('given invalid encryption key', () => {
    it('throws error', async () => {
      expect(() => decrypt(
        contestConfig,
        defaultMarkingType,
        "encryptionKey", // Invalid
        cryptograms,
        boardCommitmentOpening,
        voterCommitmentOpening
      )).to.throw("point does not have a valid vote encoding")
    });    
  });

  context('given invalid board commitment', () => {
    it('throws error', async () => {
      const invalidBoardCommitmentOpening =  {
        "commitmentRandomness": "a3f2276d06c22ec4bd952b5c7fc1b796f6cbc22054e313b20a78528234eabd12",
        "randomizers": {
            "contest ref 1": [
                "63aa3b0dc7ef1749ea83c96394f61677887582317a56e0059bd7a1ad32a16b11"
            ]
        }
      }

      expect(() => decrypt(
        contestConfig,
        defaultMarkingType,
        encryptionKey,
        cryptograms,
        invalidBoardCommitmentOpening,
        voterCommitmentOpening
      )).to.throw("point does not have a valid vote encoding")
    });    
  });

  context('given invalid voter commitment', () => {
    it('throws error', async () => {

      const invalidVoterCommitmentOpening = {
        "commitmentRandomness": "1a5a254847cd98ab07f8db9b08044db501c0ce9b03c1e9123a3ffcc36baae04d",
        "randomizers": {
            "contest ref 1": [
                "938b61e64673c2e289454a324e4a28622d577bf50498dc787883cb5aafdea026"
            ]
        }
      }

      expect(() => decrypt(
        contestConfig,
        defaultMarkingType,
        encryptionKey,
        cryptograms,
        boardCommitmentOpening,
        invalidVoterCommitmentOpening
      )).to.throw("point does not have a valid vote encoding")
    });    
  });

  context('given invalid cryptograms', () => {
    const cryptograms = {
      "contest ref 1": [
          "03c619ae7011fe86d6d60ef9ee8651fb9cca959d357c4a9f3bda62b42cf547ce6d,0309179f6e8526910ca3eb966be8c457a20a7d96181ac8ea9b5e14f8b8b37bd1f5"
      ]
    }

    it('throws error', async () => {
      expect(() => decrypt(
        contestConfig,
        defaultMarkingType,
        encryptionKey,
        cryptograms,
        boardCommitmentOpening,
        voterCommitmentOpening
      )).to.throw("not on the curve!")
    });    
  });
});
