import { CastVoteRecord, ContestConfigMap, CommitmentOpening, ContestMap, MarkingType } from "./types";
import { decryptVote } from './crypto/decrypt_vote';
import { codesToCvr } from './cvr_conversion';
import { addBigNums } from './aion_crypto';

export const decrypt = (
  contestConfigs: ContestConfigMap,
  markingType: MarkingType,
  encryptionKey: string,
  cryptograms: ContestMap<string[]>, 
  boardCommitmentOpening: CommitmentOpening, 
  voterCommitmentOpening: CommitmentOpening
): CastVoteRecord => {
  const cvrCodes = {}

  Object.keys(cryptograms).forEach(function(contestId) {
    const contestCryptograms = cryptograms[contestId]
    const boardRandomizers = boardCommitmentOpening.randomizers[contestId]
    const voterRandomizers = voterCommitmentOpening.randomizers[contestId]

    const randomizers = contestCryptograms.map((_,index) => {
      return addBigNums(voterRandomizers[index], boardRandomizers[index])
    })

    cvrCodes[contestId] = decryptVote(markingType, contestCryptograms, randomizers, encryptionKey)
  })

  return codesToCvr(contestConfigs, cvrCodes)
}
