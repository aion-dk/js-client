const Crypto = require('./aion_crypto.js')()

class AuthenticateWithCodes {
  constructor(connector) {
    this.connector = connector;
  }

  async authenticate(electionCodes, electionId, encryptionKey) {
    const keyPair = this.electionCodesToKeyPair(electionCodes);
    const voterSession = await createSession(keyPair, electionId, this.connector);
    await this.verifyEmptyCryptograms(voterSession, encryptionKey);
    return {
      precinctId: voterSession.precinctId,
      keyPair: keyPair,
      emptyCryptograms: voterSession.baseCryptograms
    }
  }

  electionCodesToKeyPair(electionCodes) {
    const privateKeys = electionCodes.map(Crypto.electionCodeToPrivateKey);
    const privateKey = privateKeys.reduce(Crypto.addBigNums);
    const { public_key: publicKey } = Crypto.generateKeyPair(privateKey);

    return {
      privateKey: privateKey,
      publicKey: publicKey
    }
  }

  async verifyEmptyCryptograms(voterSession, encryptionKey) {
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

const createSession = async function(keyPair, electionId, connector) {
  const signature = Crypto.generateSchnorrSignature('', keyPair.privateKey);
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

module.exports = AuthenticateWithCodes
