import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import axios from 'axios';
import nock = require('nock');
import {
  resetDeterminism,
  bulletinBoardHost,
  OTPProviderHost,
  voterAuthorizerHost
} from './test_helpers';
import { recordResponses } from './test_helpers'

const USE_MOCK = false;

describe('entire voter flow using OTP authorization', () => {
  let sandbox;
  let expectedNetworkRequests : any[] = [];

  beforeEach(() => {
    if(USE_MOCK) {
      sandbox = resetDeterminism();
      expectedNetworkRequests = [];

      expectedNetworkRequests.push(nock(bulletinBoardHost).get('/dbb/us/api/election_config')
        .replyWithFile(200, __dirname + '/replies/otp_flow/get_dbb_us_api_election_config.json'));
      expectedNetworkRequests.push(nock(voterAuthorizerHost).post('/create_session')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_create_session.json'));
      expectedNetworkRequests.push(nock(voterAuthorizerHost).post('/request_authorization')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_request_authorization.json'));
      expectedNetworkRequests.push(nock(OTPProviderHost).post('/authorize')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_authorize.json'));
      expectedNetworkRequests.push(nock(bulletinBoardHost).post('/dbb/us/api/registrations')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_dbb_us_api_registrations.json'));
      expectedNetworkRequests.push(nock(bulletinBoardHost).post('/dbb/us/api/commitments')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_dbb_us_api_commitments.json'));
      expectedNetworkRequests.push(nock(bulletinBoardHost).post('/dbb/us/api/votes')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_dbb_us_api_votes.json'));
      expectedNetworkRequests.push(nock(bulletinBoardHost).post('/dbb/us/api/cast')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_dbb_us_api_cast.json'));
    }
  });

  afterEach(() => {
    if (USE_MOCK) {
      sandbox.restore();
      nock.cleanAll();
    }
  });

  it('returns a receipt', async () => {
    // For recording, remember to reset AVX database and update oneTimePassword fixture value
    const performTest = async () => {
      const client = new AVClient('http://us-avx:3000/dbb/us/api');
      await client.initialize()

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

      const confirmationToken = await client.validateAccessCode(oneTimePassword).catch((e) => {
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
        .map((uuid: string) => [
          uuid,
          contestConfigs[uuid].options[0].handle
        ])

      const cvr = Object.fromEntries(contestsChoices)

      const trackingCode = await client.constructBallotCryptograms(cvr).catch((e) => {
        console.error(e);
        expect.fail('AVClient#constructBallotCryptograms failed');
      });
      // expect(trackingCode.length).to.eql(64)

      const affidavit = Buffer.from('some bytes, most likely as binary PDF').toString('base64');
      const receipt = await client.castBallot(affidavit);
      expect(receipt.length).to.eql(64)

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
    const messages = await axios.get('http://localhost:1080/messages')
      .then((response) => response.data);
    if (messages.length == 0) {
      throw 'Email message with an OTP was not found';
    }
    const lastMessageId = messages[messages.length - 1].id;
    const message = await axios.get(`http://localhost:1080/messages/${lastMessageId}.plain`)
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

