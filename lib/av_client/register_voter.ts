import { randomKeyPair} from './generate_key_pair';
import { ContestIndexed } from "./types";
const Crypto = require('./aion_crypto.js')()

export default class RegisterVoter {
  client: any;

  constructor(client) {
    this.client = client;
  }

  async call() {
    const confirmationToken = this.client.authorizationTokens;

    this.client.keyPair = {
      privateKey: '70d161fe8546c88b719c3e511d113a864013cda166f289ff6de9aba3eb4e8a4d',
      publicKey: '039490ed35e0cabb39592792d69b5d4bf2104f20df8c4bbf36ee6b705595e776d2'
    }

    const signature = Crypto.generateSchnorrSignature('', this.client.keyPair.privateKey);

    await this.client.bulletinBoard.registerVoter(this.client.keyPair.publicKey, signature).then(
      ({ data }) => {
        this.client.bulletinBoard.setVoterSessionUuid(data.voterSessionUuid);
        this.client.voterIdentifier = data.voterIdentifier;
        this.client.emptyCryptograms = data.emptyCryptograms;
        this.client.getElectionConfig().ballots = data.ballots;
      }
    )
    randomKeyPair(); // TODO: remove, this just increases deterministic randomness offset for tests

    const challenges: ContestIndexed<string> = Object.fromEntries(this.client.contestIds().map(contestId => {
      return [contestId, Crypto.generateRandomNumber()]
    }));

    const emptyCryptogramsVerified = await this.client.bulletinBoard.challengeEmptyCryptograms(challenges).then(response => {
      const responses = response.data.responses;
      const valid = this.client.contestIds().every((contestId) => {
        const emptyCryptogram = this.client.emptyCryptograms[contestId];
        const proofString = [
          emptyCryptogram.commitment,
          challenges[contestId],
          responses[contestId],
        ].join(',');
        const verified = Crypto.verifyEmptyCryptogramProof(proofString, emptyCryptogram.cryptogram, this.client.electionEncryptionKey());
        return verified;
      });
      return valid;
    })

    if (emptyCryptogramsVerified) {
      return 'OK';
    } else {
      throw new Error('Empty cryptogram verification failed')
    }
    return 'OK';
  }
}
