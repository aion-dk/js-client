import { randomKeyPair} from "./generate_key_pair";
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
    this.client.bulletinBoard.setVoterSessionUuid('"0b0c0d0e-0f10-4112-9314-15161718191a"');
    this.client.emptyCryptograms = {
      "1": {
        "cryptogram": "0312f677c72d770fb6b137fbd924001b01df46745940a279d3415f5f9c0c323f59,03125ec5752eba6c723b70fa957aa0e4a529b025d59dcb60177c74c0ecb47ebe79",
        "commitment": "0237061066a2d33aa10331c085f7d66be78f87e897719c33379dcf190508423af4"
      },
      "2": {
        "cryptogram": "031c82cd80f96195a9f2ad8f72de92cb5e0edc72463805ab31ad678aaa77d7eee4,02015b078127485900af9c661d1ad167bc25830b91a7f6882e6ee343cd8b9a3d86",
        "commitment": "030142deb975f1f884e115b3ef0a8f90147fba2a3187817811c44171a364e9eaf2"
      }
    };
    this.client.voterIdentifier = '1';

    randomKeyPair(); // TODO: remove, this just increases deterministic randomness offset for tests
    randomKeyPair(); // TODO: remove, this just increases deterministic randomness offset for tests

    const challenges = Object.fromEntries(this.client.contestIds().map(contestId => {
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
