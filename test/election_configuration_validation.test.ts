import { AVClient, ElectionConfig } from '../lib/av_client';
import {
  expectError,
  readJSON
} from './test_helpers';
import { InvalidConfigError } from '../lib/av_client/errors';

describe('election configuration validation', () => {
  let client: AVClient;
  let electionConfig: ElectionConfig;

  beforeEach(async () => {
    client = new AVClient('http://nothing.local');
    electionConfig = readJSON('./replies/otp_flow/get_us_configuration.json').electionConfig;
  });

  context('OTP provider URL is empty', () => {
    it('fails with an error', async () => {
      electionConfig.services.otpProvider.url = '';

      await expectError(
        client.initialize(electionConfig),
        InvalidConfigError,
        'Received invalid election configuration. Errors: Configuration is missing OTP Provider URL'
      );
    });
  });

  context('Voter Authorizer URL is empty', () => {
    it('fails with an error', async () => {
      electionConfig.services.voterAuthorizer.url = '';

      await expectError(
        client.initialize(electionConfig),
        InvalidConfigError,
        'Received invalid election configuration. Errors: Configuration is missing Voter Authorizer URL'
      );
    });
  });

  context('services key is missing', () => {
    it('fails with an error', async () => {
      delete (electionConfig as any).services;

      await expectError(
        client.initialize(electionConfig),
        InvalidConfigError,
        "Received invalid election configuration. Errors: Configuration is missing OTP Provider URL,\n" +
        "Configuration is missing OTP Provider election context uuid,\n" +
        "Configuration is missing OTP Provider public key,\n" +
        "Configuration is missing Voter Authorizer URL,\n" +
        "Configuration is missing Voter Authorizer election context uuid,\n" +
        "Configuration is missing Voter Authorizer public key"
      );
    });
  });
});
