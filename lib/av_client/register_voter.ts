import { randomKeyPair} from './generate_key_pair';
import { ContestIndexed } from "./types";
import { Ballot } from './election_config'
const Crypto = require('./aion_crypto.js')()

interface EmptyCryptogram {
  commitment: string;
  cryptogram: string;
}

interface RegisterVoterResponse {
  voterSessionUuid: string;
  voterIdentifier: string;
  emptyCryptograms: ContestIndexed<EmptyCryptogram>;
  ballots: Ballot[];
  /*
   Maybe we receive ballots that we can vote on.
   We need to consider if we only receive contestIds that the voter has access to.
   */
}

export async function registerVoter(bulletinBoard, keyPair, electionEncryptionKey, voterRecord, authorizationToken): Promise<RegisterVoterResponse> {
  const signature = Crypto.generateSchnorrSignature('', keyPair.privateKey)

  // TODO make this call send all relevant values to the connector
  const registerVoterResponse: RegisterVoterResponse = await bulletinBoard.registerVoter(keyPair.publicKey, signature).then(
    ({ data }) => {
      // this.bulletinBoard.setVoterSessionUuid(data.voterSessionUuid)
      // FIXME we need to make sure that the bulletinBoard gets info about its voterSessionUuid another way
      return {
        voterSessionUuid: data.voterSessionUuid,
        voterIdentifier: data.voterIdentifier,
        emptyCryptograms: data.emptyCryptograms,
        ballots: data.ballots
      }
    }
  )

  randomKeyPair(); // TODO: remove, this just increases deterministic randomness offset for tests

  const { ballots, emptyCryptograms, voterSessionUuid } = registerVoterResponse

  const contestIds = ballots.map(ballot => ballot.id.toString())

  const challenges: ContestIndexed<string> = Object.fromEntries(contestIds.map(contestId => {
    return [contestId, Crypto.generateRandomNumber()]
  }))

  // 
  bulletinBoard.setVoterSessionUuid(voterSessionUuid)

  const emptyCryptogramsVerified = await bulletinBoard.challengeEmptyCryptograms(challenges).then(response => {
    const responses = response.data.responses;
    const valid: boolean = contestIds.every((contestId) => {
      const emptyCryptogram = emptyCryptograms[contestId];
      const proofString = [
        emptyCryptogram.commitment,
        challenges[contestId],
        responses[contestId],
      ].join(',');
      return Crypto.verifyEmptyCryptogramProof(proofString, emptyCryptogram.cryptogram, electionEncryptionKey);
    });
    return valid;
  })

  if (!emptyCryptogramsVerified) {
    throw new Error('Empty cryptogram verification failed')
  }

  return registerVoterResponse;
}
