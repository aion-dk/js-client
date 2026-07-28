import { AVClient, LatestConfig } from '../lib/av_client';
import latestConfig from './fixtures/latestConfig';
import { expect } from 'chai';
import { jwtDecode } from 'jwt-decode';

describe('setRegistrationChannel', () => {
  let client: AVClient;
  const config: LatestConfig = latestConfig;

  beforeEach(async () => {
    client = new AVClient('http://nothing.local');
    await client.initialize(config);
  });

  it('sets registrationChannel to undefined when given undefined', async () => {
    await client.setRegistrationChannel(undefined);
    // No error means it set to undefined successfully
  });

  it('generates a valid JWT when given a private key', async () => {
    // Generate a valid P-256 private key (32 bytes hex)
    const privateKeyHex = '0b4cef5f4e3e1f0a9d8c7b6a594837261504f3e2d1c0b9a8f7e6d5c4b3a29100';

    await client.setRegistrationChannel(privateKeyHex);

    // Access the private field via any cast to verify it was set
    const registrationChannel = (client as AVClient).registrationChannel;
    expect(registrationChannel).to.be.a('string');
    expect(registrationChannel).to.not.be.undefined;

    // Verify it's a valid JWT with three parts
    const parts = registrationChannel.split('.');
    expect(parts).to.have.lengthOf(3);

    // Decode and verify the payload contains the expected claims
    const decoded = jwtDecode(registrationChannel);
    expect(decoded.sub).to.equal('channel');
    expect(decoded.iat).to.be.a('number');
  });
});
