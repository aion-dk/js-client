import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import axios from 'axios';
import nock = require('nock');
import {
  resetDeterminism,
  vaHost,
  bbHost,
  otpHost,
  bulletinBoardHost,
  mailcatcherHost
} from './test_helpers';
import { recordResponses } from './test_helpers'

const USE_MOCK = true;

describe('entire voter flow using OTP authorization', () => {
  let sandbox;
  let expectedNetworkRequests : nock.Scope[] = [];

  beforeEach(() => {
    sandbox = resetDeterminism();

    if(USE_MOCK) {
      expectedNetworkRequests = [
        bbHost.get_election_config(),
        vaHost.post_create_session(),
        vaHost.post_request_authorization(),
        otpHost.post_authorize(),
        bbHost.post_registrations(),
        bbHost.post_commitments(),
        bbHost.post_votes(),
        bbHost.post_cast(),
      ];
    }
  });

  afterEach(() => {
    sandbox.restore()
    if (USE_MOCK) {
      nock.cleanAll();
    }
  });

  it('returns a receipt', async () => {
    // For recording, remember to reset AVX database and update oneTimePassword fixture value
    const performTest = async () => {
      const client = new AVClient(bulletinBoardHost + 'dbb/us/api');
      await client.initialize(undefined, {
        privateKey: 'bcafc67ca4af6b462f60d494adb675d8b1cf57b16dfd8d110bbc2453709999b0',
        publicKey: '03b87d7fe793a621df27f44c20f460ff711d55545c58729f20b3fb6e871c53c49c'
      });

      const voterId = 'A00000000006'
      const voterEmail = 'mvptuser@yahoo.com'
      await client.requestAccessCode(voterId, voterEmail).catch((e) => {
        console.error(e);
        expect.fail('AVClient#requestAccessCode failed.');
      });

      let oneTimePassword: string;
      if (USE_MOCK) {
        oneTimePassword = '12345';
      } else {
        oneTimePassword = await extractOTPFromEmail();
      }

      const _confirmationToken = await client.validateAccessCode(oneTimePassword).catch((e) => {
        console.error(e);
        expect.fail('AVClient#validateAccessCode failed');
      });

      await client.registerVoter().catch((e) => {
        console.error(e);
        expect.fail('AVClient#registerVoter failed');
      })
      const { contestConfigs } = client.getElectionConfig()
      // We expect CVR value to look something like this: { '1': 'option1', '2': 'optiona' }
      const contestsChoices = Object.keys(contestConfigs)
        .map((reference: string) => [
          reference,
          contestConfigs[reference].options[0].reference
        ])

      const cvr = Object.fromEntries(contestsChoices)

      const _trackingCode = await client.constructBallot(cvr).catch((e) => {
        console.error(e);
        expect.fail('AVClient#constructBallotCryptograms failed');
      });
      // expect(trackingCode.length).to.eql(64)

      const affidavit = Buffer.from('some bytes, most likely as binary PDF').toString('base64');
      const receipt = await client.castBallot(affidavit);
      expect(typeof receipt === "string").to.be.true;

      if(USE_MOCK)
        expectedNetworkRequests.forEach((mock) => mock.done());
    };

    if(USE_MOCK) {
      await performTest();
    } else {
      return await recordResponses(async function() {
        await performTest();
      });
    }


    // });
  }).timeout(10000);

  async function extractOTPFromEmail() {
    await sleep(500);
    const messages = await axios.get(`${mailcatcherHost}messages`)
      .then((response) => response.data);
    if (messages.length == 0) {
      throw 'Email message with an OTP was not found';
    }
    const lastMessageId = messages[messages.length - 1].id;
    const message = await axios.get(`${mailcatcherHost}messages/${lastMessageId}.plain`)
      .then((response) => response.data);
    const otpPattern = /\d{5}/g;

    const patternMatches = otpPattern.exec(message);
    if (!patternMatches) {
      throw 'OTP code pattern not found in the email';
    }
    const code = patternMatches[0];
    return code;
  }

  async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
});

