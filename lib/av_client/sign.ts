const Crypto = require('./aion_crypto.js')()
import { ContestIndexed as ContestMap, EncryptedVote } from './types'

export type AcknowledgedBoardHash = {
  currentBoardHash: string;
  currentTime: string;
}

export function signVotes(encryptedVotes: ContestMap<EncryptedVote>, lastestBoardHash: AcknowledgedBoardHash, electionId: number, voterIdentifier: string, privateKey: string) {
  const votes: ContestMap<string> = {};
  const cryptogramsWithProofs = {};
  for (let contestId in encryptedVotes) {
    const { cryptogram, proof } = encryptedVotes[contestId]

    votes[contestId] = cryptogram;

    cryptogramsWithProofs[contestId] = {
      cryptogram,
      proof
    };
  }

  const contentHash = computeNextBoardHash(lastestBoardHash, electionId, voterIdentifier, votes);
  const voterSignature = Crypto.generateSchnorrSignature(contentHash, privateKey);
  return { contentHash, voterSignature, cryptogramsWithProofs };
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
