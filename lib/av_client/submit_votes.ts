const Crypto = require('./aion_crypto.js')()

export default class SubmitVotes {
  connector: any;

  constructor(connector: Connector) {
    this.connector = connector;
  }

  async signAndSubmitVotes({ voterSessionGuid, voterIdentifier, electionId, voteEncryptions, privateKey, signatureKey }) {
    const acknowledgeResponse = await this.acknowledge(voterSessionGuid)

    const votes = {}
    const cryptogramsWithProofs = {}
    for (let contestId in voteEncryptions) {
      votes[contestId] = voteEncryptions[contestId].cryptogram
      cryptogramsWithProofs[contestId] = {
        cryptogram: voteEncryptions[contestId].cryptogram,
        proof: voteEncryptions[contestId].proof
      }
    }

    const content = {
      acknowledged_at: acknowledgeResponse.currentTime,
      acknowledged_board_hash: acknowledgeResponse.currentBoardHash,
      election_id: electionId,
      voter_identifier: voterIdentifier,
      votes: votes
    };

    let contentString = JSON.stringify(content)
    let contentHash = Crypto.hashString(contentString)
    const voterSignature = this.sign(contentHash, privateKey)

    const receipt = await this.submit({ voterSessionGuid, contentHash, voterSignature, cryptogramsWithProofs })
    await this.verifyReceipt({ contentHash, voterSignature, receipt, signatureKey });

    return receipt
  }

  private async submit({ voterSessionGuid, contentHash, voterSignature, cryptogramsWithProofs }) {
    return this.connector.submitVotes( voterSessionGuid, contentHash, voterSignature, cryptogramsWithProofs )
      .then(({ data }) => {
        if (data.error) {
          return Promise.reject(data.error.description);
        }

        const receipt = {
          previousBoardHash: data.previousBoardHash,
          boardHash: data.boardHash,
          registeredAt: data.registeredAt,
          serverSignature: data.serverSignature,
          voteSubmissionId: data.voteSubmissionId
        }

        return Promise.resolve(receipt);
      });
  }

  private async acknowledge(voterSessionGuid) {
    return this.connector.getBoardHash(voterSessionGuid)
      .then(({ data }) => {
        if (!data.currentBoardHash || !data.currentTime) {
          return Promise.reject('Could not get latest board hash');
        }

        const acknowledgedBoard = {
          currentBoardHash: data.currentBoardHash,
          currentTime: data.currentTime
        }
        return Promise.resolve(acknowledgedBoard);
      });
  }

  private sign(contentHash: HashValue, privateKey: PrivateKey) {
    return Crypto.generateSchnorrSignature(
      contentHash,
      privateKey
    )
  }

  private async verifyReceipt({ contentHash, voterSignature, receipt, signatureKey }) {
    let valid = false;

    // verify board hash computation
    const boardHashObject = {
      content_hash: contentHash,
      previous_board_hash: receipt.previousBoardHash,
      registered_at: receipt.registeredAt
    }
    const boardHashString = JSON.stringify(boardHashObject)
    const computedBoardHash = Crypto.hashString(boardHashString)

    valid = computedBoardHash == receipt.boardHash
    if (!valid) {
      return Promise.reject('Invalid vote receipt: corrupt board hash')
    }

    // verify server signature
    const receiptHashObject = {
      board_hash: receipt.boardHash,
      signature: voterSignature
    }
    const receiptHashString = JSON.stringify(receiptHashObject)
    const receiptHash = Crypto.hashString(receiptHashString)

    valid = Crypto.verifySchnorrSignature(receipt.serverSignature, receiptHash, signatureKey)
    if (valid) {
      return Promise.resolve('Valid vote receipt')
    } else {
      return Promise.reject('Invalid vote receipt: corrupt server signature')
    }
  }

}

interface Connector {
  getBoardHash: (voterSessionGuid: string) => any;
  submitVotes: (voterSessionGuid: string, contentHash: HashValue, signature: Signature, cryptogramsWithProofs: ContestIndexed<CryptogramWithProof>) => any
}

interface ContestIndexed<Type> {
  [index: string]: Type;
}

type CryptogramWithProof = {
  cryptogram: Cryptogram;
  proof: Proof;
}

type Proof = string
type Cryptogram = string
type Signature = string;
type PrivateKey = string
type HashValue = string;

type AcknowledgedBoard = {
  currentBoardHash: HashValue;
  currentTime: string;
}

type VoteReceipt = {
  previousBoardHash: HashValue;
  boardHash: HashValue;
  registeredAt: string;
  serverSignature: Signature
}
