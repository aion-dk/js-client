/*eslint-disable @typescript-eslint/no-explicit-any*/
import { AVClient, LatestConfig } from '../lib/av_client';
import {
  expectError,
  readJSON
} from './test_helpers';
import { InvalidConfigError } from '../lib/av_client/errors';

describe('election configuration validation', () => {
  let client: AVClient;
  let latestConfig: LatestConfig;

  beforeEach(async () => {
    client = new AVClient('http://nothing.local');
    latestConfig = readJSON('./replies/otp_flow/get_us_configuration.json');
  });

  context('OTP provider URL is empty', () => {
    it('fails with an error', async () => {
      
      latestConfig.items.voterAuthorizerConfig.content.identityProvider.url = '';

      await expectError(
        client.initialize(latestConfig),
        InvalidConfigError,
        'Received invalid election configuration. Errors: Configuration is missing OTP Provider URL'
      );
    });
  });

  context('Voter Authorizer URL is empty', () => {
    it('fails with an error', async () => {
      latestConfig.items.voterAuthorizerConfig.content.voterAuthorizer.url = '';

      await expectError(
        client.initialize(latestConfig),
        InvalidConfigError,
        'Received invalid election configuration. Errors: Configuration is missing Voter Authorizer URL'
      );
    });
  });

  context('services key is missing', () => {
    it('fails with an error', async () => {
      delete (latestConfig as any).items.voterAuthorizerConfig;

      await expectError(
        client.initialize(latestConfig),
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
