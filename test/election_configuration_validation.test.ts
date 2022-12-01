/*eslint-disable @typescript-eslint/no-explicit-any*/
import { AVClient } from '../lib/av_client';
import { LatestConfig } from '../lib/av_client/types';
import { expectError } from './test_helpers';
import { InvalidConfigError } from '../lib/av_client/errors';
import latestConfig from './fixtures/latestConfig'

describe('election configuration validation', () => {
  let client: AVClient;
  const config: LatestConfig = latestConfig

  beforeEach(async () => {
    client = new AVClient('http://nothing.local');
  });

  context('OTP provider URL is empty', () => {
    it('fails with an error', async () => {
      
      config.items.voterAuthorizerConfig.content.identityProvider.url = '';
      
      await expectError(
        client.initialize(config),
        InvalidConfigError,
        'Received invalid election configuration. Errors: Configuration is missing OTP Provider URL'
        );

        latestConfig.items.voterAuthorizerConfig.content.identityProvider.url = 'http://otp:3001';
    });
  });

  context('Voter Authorizer URL is empty', () => {
    it('fails with an error', async () => {
      config.items.voterAuthorizerConfig.content.voterAuthorizer.url = '';

      await expectError(
        client.initialize(config),
        InvalidConfigError,
        'Received invalid election configuration. Errors: Configuration is missing Voter Authorizer URL'
      );
    });
  });

  context('services key is missing', () => {
    it('fails with an error', async () => {
      delete (config as any).items.voterAuthorizerConfig;

      await expectError(
        client.initialize(config),
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
