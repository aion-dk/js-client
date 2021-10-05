import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import { readJSON } from './test_helpers';

describe('election configuration validation', function() {
  let client: AVClient;
  let electionConfig: any;

  beforeEach(async () => {
    client = new AVClient('http://localhost:3000/test/app');
    electionConfig = readJSON('./replies/otp_flow/get_test_app_config.json');
  });

  context('OTP provider URL is empty', () => {
    it('fails with an error', async () => {
      electionConfig.services.otp_provider.url = '';

      try {
        await client.initialize(electionConfig);
        expect.fail('Expected an InvalidConfigError, got no error');
      } catch (e) {
        expect(e.name).to.eql('InvalidConfigError');
        expect(e.message).to.include('Received invalid election configuration');
        expect(e.message).to.include('Configuration is missing OTP Provider URL');
      }
    })
  });

  context('Voter Authorizer URL is empty', () => {
    it('fails with an error', async () => {
      electionConfig.services.voter_authorizer.url = '';

      try {
        await client.initialize(electionConfig);
        expect.fail('Expected an InvalidConfigError, got no error');
      } catch (e) {
        expect(e.name).to.eql('InvalidConfigError');
        expect(e.message).to.include('Received invalid election configuration');
        expect(e.message).to.include('Configuration is missing Voter Authorizer URL');
      }
    })
  });

  context('services key is missing', () => {
    it('fails with an error', async () => {
      delete electionConfig.services;

      try {
        await client.initialize(electionConfig);
        expect.fail('Expected an InvalidConfigError, got no error');
      } catch (e) {
        expect(e.name).to.eql('InvalidConfigError');
        expect(e.message).to.include('Received invalid election configuration');
        expect(e.message).to.include('Configuration is missing OTP Provider URL');
        expect(e.message).to.include('Configuration is missing Voter Authorizer URL');
      }
    })
  });
});
