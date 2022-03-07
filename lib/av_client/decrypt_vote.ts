import { CastVoteRecord, CommitmentOpening, ContestMap, MarkingType } from "./types";
import { decryptVote } from './crypto/decrypt_vote';
import { addBigNums } from './aion_crypto';

export const decrypt = (
  markingType: MarkingType,
  encryptionKey: string,
  cryptograms: ContestMap<string[]>, 
  boardCommitmentOpening: CommitmentOpening, 
  voterCommitmentOpening: CommitmentOpening
): CastVoteRecord => {
  const contestSelections = {}

  Object.keys(cryptograms).forEach(function(contestId) {
    const contestCryptograms = cryptograms[contestId]
    const boardRandomizers = boardCommitmentOpening.randomizers[contestId]
    const voterRandomizers = voterCommitmentOpening.randomizers[contestId]

    const randomizers = contestCryptograms.map((_,index) => {
      return addBigNums(voterRandomizers[index], boardRandomizers[index])
    })

    contestSelections[contestId] = decryptVote(markingType, contestCryptograms, randomizers, encryptionKey)
  })

  return contestSelections
}
