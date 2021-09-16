const Crypto = require('./aion_crypto.js')()
import { ContestIndexed as ContestMap, OpenableEnvelope, SealedEnvelope } from './types'

export type AcknowledgedBoardHash = {
  currentBoardHash: string;
  currentTime: string;
}

export function signVotes(encryptedVotes: ContestMap<OpenableEnvelope>, lastestBoardHash: AcknowledgedBoardHash, electionId: number, voterIdentifier: string, privateKey: string) {
  const votes: ContestMap<string> = {};

  for (const contestId in encryptedVotes) {
    votes[contestId] =  encryptedVotes[contestId].cryptogram;
  }

  const contentHash = computeNextBoardHash(lastestBoardHash, electionId, voterIdentifier, votes);
  const voterSignature = Crypto.generateSchnorrSignature(contentHash, privateKey);
  return { contentHash, voterSignature };
}

export const sealEnvelopes = (encryptedVotes: ContestMap<OpenableEnvelope>): ContestMap<SealedEnvelope> => {
  const sealEnvelope = (envelope: OpenableEnvelope): SealedEnvelope => {
    const { cryptogram, randomness } = envelope;
    const proof = Crypto.generateDiscreteLogarithmProof(randomness)
    return { cryptogram, proof }
  }

  return Object.fromEntries(Object.keys(encryptedVotes).map(k => [k, sealEnvelope(encryptedVotes[k])]))
}

export function assertValidReceipt({ contentHash, voterSignature, receipt, electionSigningPublicKey }): void {
  // verify board hash computation
  const boardHashObject = {
    content_hash: contentHash,
    previous_board_hash: receipt.previousBoardHash,
    registered_at: receipt.registeredAt
  }

  const boardHashString = JSON.stringify(boardHashObject)
  const computedBoardHash = Crypto.hashString(boardHashString)

  //console.log(computedBoardHash, 'not equal?', receipt.boardHash)

  if (computedBoardHash != receipt.boardHash) {
    throw new Error('Invalid vote receipt: corrupt board hash')
  }

  // verify server signature
  const receiptHashObject = {
    board_hash: receipt.boardHash,
    signature: voterSignature
  }

  //console.log(receiptHashObject)

  const receiptHashString = JSON.stringify(receiptHashObject)
  const receiptHash = Crypto.hashString(receiptHashString)

  if (!Crypto.verifySchnorrSignature(receipt.serverSignature, receiptHash, electionSigningPublicKey)) {
    //console.log('server signature ', receipt.serverSignature)
    throw new Error('Invalid vote receipt: corrupt server signature')
  }
}

function computeNextBoardHash(lastestBoardHash: AcknowledgedBoardHash, electionId: number, voterIdentifier: string, votes: ContestMap<string>) {
  const content = {
    acknowledged_at: lastestBoardHash.currentTime,
    acknowledged_board_hash: lastestBoardHash.currentBoardHash,
    election_id: electionId,
    voter_identifier: voterIdentifier,
    votes
  };

  const contentString = JSON.stringify(content);
  const contentHash = Crypto.hashString(contentString);
  return contentHash;
}
