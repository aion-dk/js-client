const Crypto = require('./aion_crypto.js')()

export default class AuthenticateWithCodes {
  bulletinBoard: any;

  constructor(bulletinBoard) {
    this.bulletinBoard = bulletinBoard;
  }

  async authenticate(electionCodes: string[], electionId: number, encryptionKey: string) {
    const keyPair = this.electionCodesToKeyPair(electionCodes);
    const voterSession = await createSession(keyPair, electionId, this.bulletinBoard);
    this.bulletinBoard.setVoterSessionUuid(voterSession.voterSessionUuid);
    await this.verifyEmptyCryptograms(voterSession, encryptionKey);
    return {
      voterIdentifier: voterSession.voterIdentifier,
      precinctId: voterSession.precinctId,
      keyPair,
      emptyCryptograms: voterSession.emptyCryptograms
    }
  }

  private electionCodesToKeyPair(electionCodes: string[]): KeyPair {
    const privateKeys = electionCodes.map(Crypto.electionCodeToPrivateKey);
    const privateKey = privateKeys.reduce(Crypto.addBigNums);
    const { public_key: publicKey } = Crypto.generateKeyPair(privateKey);

    return <KeyPair>{ privateKey, publicKey }
  }

  private async verifyEmptyCryptograms(voterSession, encryptionKey: string) {
    const { contestIds, emptyCryptograms } = voterSession;

    const challenges = Object.fromEntries(contestIds.map(contestId => {
      return [contestId, Crypto.generateRandomNumber()]
    }));

    return this.bulletinBoard.challengeEmptyCryptograms(challenges).then(response => {
      const responses = response.data.responses;
      const valid = contestIds.every((contestId) => {
        const emptyCryptogram = emptyCryptograms[contestId];
        const proofString = [
          emptyCryptogram.commitment,
          challenges[contestId],
          responses[contestId],
        ].join(',');
        const verified = Crypto.verifyEmptyCryptogramProof(proofString, emptyCryptogram.cryptogram, encryptionKey);
        return verified;
      })

      if (valid) {
        return Promise.resolve('Empty cryptograms verified');
      } else {
        return Promise.reject('Empty cryptogram challenge proof was invalid');
      }
    })
  }
}

const createSession = async function(keyPair: KeyPair, electionId: number, bulletinBoard: BulletinBoard) {
  const signature = <Signature>Crypto.generateSchnorrSignature('', keyPair.privateKey);
  return bulletinBoard.createSession(keyPair.publicKey, signature)
    .then(({ data }) => {
      if (!data.ballotIds || data.ballotIds.length == 0) {
        return Promise.reject('No ballots found for the submitted election codes');
      }

      const contestIds = data.ballotIds;
      const emptyCryptograms = {};
      contestIds.forEach(contestId => {
        const {
          empty_cryptogram: cryptogram,
          commitment_point: commitment
        } = data.emptyCryptograms[contestId];
        emptyCryptograms[contestId] = { cryptogram, commitment };
      });

      const voterSession = {
        electionId,
        voterSessionUuid: data.voterSessionUuid,
        voterIdentifier: data.voterIdentifier,
        contestIds,
        emptyCryptograms,
        precinctId: '909'
      };
      return voterSession;
    });
}

interface BulletinBoard {
  challengeEmptyCryptograms: (array) => Promise<boolean | string>,
  createSession: (PublicKey, Signature) => any
}

type KeyPair = {
  privateKey: string;
  publicKey: string;
}

type Signature = string;
type PublicKey = string;
