import { AVClient } from '../lib/av_client';
import { expect } from 'chai';

describe('AVClient#getAuthorizationMethod', function() {
  let client;
  let sandbox;

  beforeEach(function() {
    client = new AVClient('http://localhost:3000/test/app');
    client.electionConfig = require('./replies/config.valid.json');
  });

  context('bulletin board returns a config, mode is election codes', function() {
    it('returns the appropriate method name', function() {
      client.electionConfig.authorizationMode = 'election codes';
      const result = client.getAuthorizationMethod();
      expect(result.methodName).to.equal('authenticateWithCodes');
      expect(result.method).to.equal(client.authenticateWithCodes);
    });
  });

  context('bulletin board returns a config, mode is OTPs', function() {
    it('returns the appropriate method name', function() {
      client.electionConfig.authorizationMode = 'otps';
      const result = client.getAuthorizationMethod();
      expect(result.methodName).to.equal('initiateDigitalReturn');
      expect(result.method).to.equal(client.initiateDigitalReturn);
    })
  });

  context('election config is not available', function() {
    it('returns an error', function() {
      delete client['electionConfig'];
      expect(() => client.getAuthorizationMethod()).to.throw(Error, 'Please fetch election config first');
    })
  });

  context('election config value for authorization mode is not available', function() {
    it('returns an error', function() {
      delete client.electionConfig['authorizationMode'];
      expect(() => client.getAuthorizationMethod()).to.throw(Error, 'Authorization method not found in election config');
    })
  });
});
