const Crypto = require('./aion_crypto.js')()

export default class AuthenticateWithCodes {
  connector: any;

  constructor(connector) {
    this.connector = connector;
  }

  async authenticate(electionCodes: string[], electionId: string, encryptionKey: string) {
    const keyPair = this.electionCodesToKeyPair(electionCodes);
    const voterSession = await createSession(keyPair, electionId, this.connector);
    await this.verifyEmptyCryptograms(voterSession, encryptionKey);
    return {
      voterSessionGuid: voterSession.voterSessionGuid,
      voterIdentifier: voterSession.voterIdentifier,
      precinctId: voterSession.precinctId,
      keyPair: keyPair,
      emptyCryptograms: voterSession.emptyCryptograms
    }
  }

  private electionCodesToKeyPair(electionCodes: string[]): KeyPair {
    const privateKeys = electionCodes.map(Crypto.electionCodeToPrivateKey);
    const privateKey = privateKeys.reduce(Crypto.addBigNums);
    const { public_key: publicKey } = Crypto.generateKeyPair(privateKey);

    return <KeyPair>{
      privateKey: privateKey,
      publicKey: publicKey
    }
  }

  private async verifyEmptyCryptograms(voterSession, encryptionKey: string) {
    const { contestIds, voterSessionGuid, emptyCryptograms } = voterSession;

    const challenges = Object.fromEntries(contestIds.map(contestId => {
      return [contestId, Crypto.generateRandomNumber()]
    }));

    return this.connector.challengeEmptyCryptograms(voterSessionGuid, challenges).then(response => {
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

const createSession = async function(keyPair: KeyPair, electionId: string, connector: Connector) {
  const signature = <Signature>Crypto.generateSchnorrSignature('', keyPair.privateKey);
  return connector.createSession(keyPair.publicKey, signature)
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
        electionId: electionId,
        voterSessionGuid: data.voterSessionUuid,
        voterIdentifier: data.voterIdentifier,
        contestIds: contestIds,
        emptyCryptograms: emptyCryptograms,
        precinctId: '909'
      };
      return voterSession;
    });
}

interface Connector {
  challengeEmptyCryptograms: (string, array) => Promise<boolean | string>,
  createSession: (PublicKey, Signature) => any
}

type KeyPair = {
  privateKey: string;
  publicKey: string;
}

type Signature = string;
type PublicKey = string;
