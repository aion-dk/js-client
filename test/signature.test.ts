import { expect } from 'chai';
import { signVotes } from '../lib/av_client/sign';

const Crypto = require('../lib/av_client/aion_crypto')()

describe('Sign', () => {
  const lastestBoardHash = { currentBoardHash: 'abc', currentTime: '2019-09-05 12:19:34' }
  const votes = { 1: { cryptogram: 'a', randomness: 'b', proof: 'c' } }

  beforeEach(async () => {

  });

  afterEach( () => {
  })

  context('sign votes', () => {
    it('signing votes yields new board hash', async () => {
      const { contentHash } = signVotes(
        votes,
        'private_test_key',
        {
          acknowledged_at: lastestBoardHash.currentTime,
          acknowledged_board_hash: lastestBoardHash.currentBoardHash,
          election_id: 1,
          voter_identifier: 'voter_id_123'
        })

      expect(contentHash).to.eql('e140dd4195fae11fbfc977b783d1e6b15f2225bf1f41329be7d0147c5e4ff02c')
    });

    it('corrupted voter id yields different content hash', async () => {
      const correctVoterHash = signVotes(
        votes,
        'private_test_key',
        {
          acknowledged_at: lastestBoardHash.currentTime,
          acknowledged_board_hash: lastestBoardHash.currentBoardHash,
          election_id: 1,
          voter_identifier: 'voter_id_123'
        }).contentHash
      const badVoterHash = signVotes(
        votes,
        'private_test_key',
        {
          acknowledged_at: lastestBoardHash.currentTime,
          acknowledged_board_hash: lastestBoardHash.currentBoardHash,
          election_id: 1,
          voter_identifier: 'corrupted_voter_id'
        }).contentHash

      expect(correctVoterHash).to.not.eq(badVoterHash)
    });

    // it('corrupted voter id yields different content hash', async () => {
    //   console.log(Crypto.hashString("sune123"))
    //   console.log(Crypto.hashString("sune123"))
    //   console.log(Crypto.hashString("sune123"))
    // });
  });
});