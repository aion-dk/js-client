import { AVClient } from '../lib/av_client';
import { CorruptCvrError } from '../lib/av_client/errors';
import nock = require('nock');
import {
  expectError,
  resetDeterminism,
  bbHost,
  vaHost,
  otpHost,
  bulletinBoardHost
} from './test_helpers';
import { expect } from 'chai';

describe('AVClient#constructBallotCryptograms', () => {
  let client: AVClient;
  let sandbox;

  beforeEach(async () => {
    sandbox = resetDeterminism();

    bbHost.get_election_config();
    vaHost.post_create_session();
    vaHost.post_request_authorization();
    otpHost.post_authorize();
    bbHost.post_registrations();
    bbHost.post_commitments();
    bbHost.post_votes();

    client = new AVClient(bulletinBoardHost + 'us');
    await client.initialize(undefined, {
      privateKey: 'bcafc67ca4af6b462f60d494adb675d8b1cf57b16dfd8d110bbc2453709999b0',
      publicKey: '03b87d7fe793a621df27f44c20f460ff711d55545c58729f20b3fb6e871c53c49c'
    });
  });

  afterEach(() => {
    sandbox.restore();
    nock.cleanAll();
  });

  context('given previous steps succeeded, and it receives valid values', () => {
    it('encrypts correctly', async () => {
      await client.requestAccessCode('voter123', 'voter@foo.bar');
      await client.validateAccessCode('1234');
      await client.registerVoter()

      const cvr = {
        'contest ref 1': 'option ref 1',
        'contest ref 2': 'option ref 3'
      };

      const trackingCode = await client.constructBallot(cvr);

      expect(typeof trackingCode === "string").to.be.true;
    });
  });

  context('given invalid CVR', () => {
    it('cvr not matching voter group eligibility', async () => {
      await client.requestAccessCode('voter123', 'voter@foo.bar');
      await client.validateAccessCode('1234');
      await client.registerVoter()

      const cvr = { 
        'contest ref 1': 'option ref 1', 
        'bogus contest ref': 'option ref 3'
      };

      await expectError(
        client.constructBallot(cvr),
        CorruptCvrError,
        'Corrupt CVR: Not eligible'
      );
    });

    it('encryption fails when voting on invalid option', async () => {
      await client.requestAccessCode('voter123', 'voter@foo.bar');
      await client.validateAccessCode('1234');
      await client.registerVoter()

      const cvr = {
        'contest ref 1': 'option ref 1',
        'contest ref 2': 'bogus option ref'
      };

      await expectError(
        client.constructBallot(cvr),
        CorruptCvrError,
        'Corrupt CVR: Contains invalid option'
      );
    });
  });
});
