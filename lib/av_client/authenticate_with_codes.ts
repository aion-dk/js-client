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
      emptyCryptograms: voterSession.baseCryptograms
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
    const { contestIds, voterSessionGuid, baseCryptograms } = voterSession;

    const challenges = Object.fromEntries(contestIds.map(contestId => {
      return [contestId, Crypto.generateRandomNumber()]
    }));

    return this.connector.challengeEmptyCryptograms(voterSessionGuid, challenges).then(response => {
      const responses = response.data.responses;
      const valid = contestIds.every((contestId) => {
        const baseCryptogram = baseCryptograms[contestId];
        const proofString = [
          baseCryptogram.commitmentPoint,
          challenges[contestId],
          responses[contestId],
        ].join(',');
        const verified = Crypto.verifyEmptyCryptogramProof(proofString, baseCryptogram.emptyCryptogram, encryptionKey);
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
        return Promise.reject("No ballots found for the submitted election codes");
      }

      const contestIds = data.ballotIds;
      const baseCryptograms = {};
      contestIds.forEach(contestId => {
        const {
          empty_cryptogram: emptyCryptogram,
          commitment_point: commitmentPoint
        } = data.emptyCryptograms[contestId];
        baseCryptograms[contestId] = { emptyCryptogram, commitmentPoint };
      });

      const voterSession = {
        electionId: electionId,
        voterSessionGuid: data.voterSessionUuid,
        voterIdentifier: data.voterIdentifier,
        contestIds: contestIds,
        baseCryptograms: baseCryptograms,
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
