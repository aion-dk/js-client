import { KeyPair } from './types';
import { BulletinBoard } from './connectors/bulletin_board';
import * as crypto from './aion_crypto'
const Crypto = crypto();

export default class AuthenticateWithCodes {
  private bulletinBoard: BulletinBoard;

  constructor(bulletinBoard: BulletinBoard) {
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

      if (!valid) {
        throw new Error('Empty cryptogram challenge proof was invalid');
      }
    })
  }
}

const createSession = async function(keyPair: KeyPair, electionId: number, bulletinBoard: BulletinBoard) {
  const signature = <Signature>Crypto.generateSchnorrSignature('', keyPair.privateKey);
  return bulletinBoard.createSession(keyPair.publicKey, signature)
    .then(({ data }) => {
      if (!data.ballotIds || data.ballotIds.length == 0) {
        throw new Error('No ballots found for the submitted election codes');
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
        precinctId: '909' // TODO: Hardcoded number?!
      };
      return voterSession;
    });
}

type Signature = string;
