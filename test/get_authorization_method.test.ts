import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import {
  expectError,
  readJSON
} from './test_helpers';
import {
  InvalidConfigError,
  InvalidStateError
} from '../lib/av_client/errors';

describe('AVClient#getAuthorizationMethod', () => {
  let electionConfig: any;
  let client: AVClient;

  beforeEach(() => {
    electionConfig = readJSON('./replies/otp_flow/get_test_app_config.json');
    client = new AVClient('http://us-avx:3000/us/app');
  });

  context('bulletin board returns a config, mode is election codes', () => {
    it('returns the appropriate method name', async () => {
      electionConfig.authorizationMode = 'election codes';

      await client.initialize(electionConfig);

      const result = client.getAuthorizationMethod();
      expect(result.methodName).to.equal('authenticateWithCodes');
      expect(result.method).to.equal(client.authenticateWithCodes);
    });
  });

  context('bulletin board returns a config, mode is OTPs', () => {
    it('returns the appropriate method name', async () => {
      electionConfig.authorizationMode = 'otps';

      await client.initialize(electionConfig);

      const result = client.getAuthorizationMethod();
      expect(result.methodName).to.equal('requestAccessCode');
      expect(result.method).to.equal(client.requestAccessCode);
    });
  });

  context('election config is not available', () => {
    it('returns an error', async () => {
      await expectError(
        () => client.getAuthorizationMethod(),
        InvalidStateError,
        'No configuration loaded. Did you call initialize()?'
      );
    });
  });

  context('election config value for authorization mode is not available', () => {
    it('returns an error', async () => {
      delete electionConfig['authorizationMode'];

      await client.initialize(electionConfig);

      await expectError(
        () => client.getAuthorizationMethod(),
        InvalidConfigError,
        'Authorization method not found in election config'
      );
    });
  });
});
