import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import { InvalidConfigError, InvalidStateError } from '../lib/av_client/errors'

describe('AVClient#getAuthorizationMethod', function() {
  let client: AVClient;

  beforeEach(async function() {
    client = new AVClient('http://localhost:3000/test/app');
    let electionConfig = require('./replies/otp_flow/get_test_app_config.json');
    await client.initialize(electionConfig)
  });

  context('bulletin board returns a config, mode is election codes', function() {
    it('returns the appropriate method name', function() {
      client.getElectionConfig().authorizationMode = 'election codes';
      const result = client.getAuthorizationMethod();
      expect(result.methodName).to.equal('authenticateWithCodes');
      expect(result.method).to.equal(client.authenticateWithCodes);
    });
  });

  context('bulletin board returns a config, mode is OTPs', function() {
    it('returns the appropriate method name', function() {
      client.getElectionConfig().authorizationMode = 'otps';
      const result = client.getAuthorizationMethod();
      expect(result.methodName).to.equal('requestAccessCode');
      expect(result.method).to.equal(client.requestAccessCode);
    })
  });

  context('election config is not available', function() {
    it('returns an error', function() {
      client = new AVClient('http://localhost:3000/test/app');
      expect(() => client.getAuthorizationMethod()).to.throw(InvalidStateError, 'No configuration loaded. Did you call initialize()?');
    })
  });

  context('election config value for authorization mode is not available', function() {
    it('returns an error', async function() {
      let electionConfig = require('./replies/otp_flow/get_test_app_config.json')
      delete electionConfig['authorizationMode']

      await client.initialize(electionConfig)

      expect(() => client.getAuthorizationMethod()).to.throw(InvalidConfigError, 'Authorization method not found in election config');
    })
  });
});
