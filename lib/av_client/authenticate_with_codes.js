const Crypto = require('./aion_crypto.js')()

class AuthenticateWithCodes {
  constructor(connector, storage) {
    this.connector = connector;
    this.storage = storage;
  }

  async authenticate(electionCodes) {
    const keyPair = this.electionCodesToKeyPair(electionCodes);
    const voterSession = await createSession(keyPair, this.connector);
    // await verifyEmptyCryptograms(voterSession)
    // console.log('empty cryptograms verified')
    // return { keyPair, voterSession }
    this.storage.set('precinctId', 'implement-precinct-id');
    this.storage.set('keyPair', ['fakePrivateKey', 'fakePublicKey']);
    this.storage.set('emptyCryptograms', ['fake cryptograms']);
    return Promise.resolve('Success');
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
}

const createSession = async function(keyPair, connector) {
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
        electionId: '123', // FIXME
        voterSessionGuid: data.voterSessionUuid,
        voterIdentifier: data.voterIdentifier,
        contestIds: contestIds,
        baseCryptograms: baseCryptograms,
        precinctId: '909'
      };
      return voterSession;
    })
}

module.exports = AuthenticateWithCodes
