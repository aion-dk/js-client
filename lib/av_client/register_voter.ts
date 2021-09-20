import { randomKeyPair} from './generate_key_pair';
import { ContestIndexed, EmptyCryptogram, KeyPair } from "./types";
import { BulletinBoard } from './connectors/bulletin_board';
import * as crypto from './aion_crypto'
const Crypto = crypto();

interface RegisterVoterResponse {
  voterSessionUuid: string;
  voterIdentifier: string;
  emptyCryptograms: ContestIndexed<EmptyCryptogram>;
  contestIds: number[];
  /*
   Maybe we receive ballots that we can vote on.
   We need to consider if we only receive contestIds that the voter has access to.
   */
}

export async function registerVoter(bulletinBoard: BulletinBoard, keyPair: KeyPair, electionEncryptionKey: string, authorizationToken: string): Promise<RegisterVoterResponse> {
  const signature = Crypto.generateSchnorrSignature('', keyPair.privateKey)

  // TODO make this call send all relevant values to the connector
  const registerVoterResponse: RegisterVoterResponse = await bulletinBoard.registerVoter(authorizationToken, signature).then(
    ({ data }) => {
      // this.bulletinBoard.setVoterSessionUuid(data.voterSessionUuid)
      // FIXME we need to make sure that the bulletinBoard gets info about its voterSessionUuid another way
      return {
        voterSessionUuid: data.voterSessionUuid,
        voterIdentifier: data.voterIdentifier,
        emptyCryptograms: data.emptyCryptograms,
        contestIds: data.ballotIds
      } as RegisterVoterResponse
    }
  )

  randomKeyPair(); // TODO: remove, this just increases deterministic randomness offset for tests

  const { contestIds, emptyCryptograms, voterSessionUuid } = registerVoterResponse

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
        emptyCryptogram.commitment_point,
        challenges[contestId],
        responses[contestId],
      ].join(',');
      return Crypto.verifyEmptyCryptogramProof(proofString, emptyCryptogram.empty_cryptogram, electionEncryptionKey);
    });
    return valid;
  })

  if (!emptyCryptogramsVerified) {
    throw new Error('Empty cryptogram verification failed')
  }

  return registerVoterResponse;
}
