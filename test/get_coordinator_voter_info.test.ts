import nock = require('nock');

import { AVClient, LatestConfig } from '../lib/av_client';
import { InvalidStateError } from '../lib/av_client/errors';
import latestConfig from './fixtures/latestConfig';
import { expectError } from './test_helpers';
import { expect } from 'chai';

const voterAuthorizerHost = 'http://voter-authorizer:3002';

describe('AVClient#getCoordinatorVoterInfo', () => {
  let client: AVClient;
  const config: LatestConfig = latestConfig;

  beforeEach(async () => {
    client = new AVClient('http://nothing.local');
    await client.initialize(config);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  context('with a proof of election codes', () => {
    it('sends the voter public key and the proof', async () => {
      client.generateProofOfElectionCodes(['1']);
      const { mainKeyPair, proof } = (client as any).proofOfElectionCodes;

      let query;
      nock(voterAuthorizerHost)
        .get('/voter_info')
        .query(q => { query = q; return true; })
        .reply(200, { voterInfo: 'info' });

      const response = await client.getCoordinatorVoterInfo();

      expect(response.data).to.eql({ voterInfo: 'info' });
      expect(query).to.eql({
        publicKey: mainKeyPair.publicKey,
        voterPublicKey: mainKeyPair.publicKey,
        proof: proof,
      });
    });
  });

  context('with an identity confirmation token', () => {
    it('sends only the identity confirmation token', async () => {
      client.setIdentityToken('identity-token');

      let query;
      nock(voterAuthorizerHost)
        .get('/voter_info')
        .query(q => { query = q; return true; })
        .reply(200, { voterInfo: 'info' });

      const response = await client.getCoordinatorVoterInfo();

      expect(response.data).to.eql({ voterInfo: 'info' });
      expect(query).to.eql({ identitiyConfirmationToken: 'identity-token' });
    });
  });

  context('with both a proof and an identity confirmation token', () => {
    it('prefers the proof of election codes', async () => {
      client.generateProofOfElectionCodes(['1']);
      client.setIdentityToken('identity-token');

      let query;
      nock(voterAuthorizerHost)
        .get('/voter_info')
        .query(q => { query = q; return true; })
        .reply(200, {});

      await client.getCoordinatorVoterInfo();

      expect(query).to.have.property('proof');
      expect(query).to.not.have.property('identitiyConfirmationToken');
    });
  });

  context('without any way of identifying the voter', () => {
    it('throws an InvalidStateError', async () => {
      await expectError(
        client.getCoordinatorVoterInfo(),
        InvalidStateError,
        'No way of identifying voter. Please generate a public key or supply an identityToken'
      );
    });
  });
});
