import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import axios from 'axios';
const { execSync } = require('child_process');
require('dotenv').config();
import * as path from 'path';
import nock = require('nock');
import {
  resetDeterminism,
  bulletinBoardHost,
  OTPProviderHost,
  voterAuthorizerHost
} from './test_helpers';
import { recordResponses } from './test_helpers'

const USE_MOCK = true;

describe('entire voter flow using OTP authorization', () => {
  let sandbox;
  let expectedNetworkRequests : any[] = [];

  beforeEach(() => {
    if(USE_MOCK) {
      sandbox = resetDeterminism();
      expectedNetworkRequests = [];
      expectedNetworkRequests.push(nock(bulletinBoardHost).get('/mobile-api/us/config')
        .replyWithFile(200, __dirname + '/replies/otp_flow/get_us_app_config.json'));
      expectedNetworkRequests.push(nock(voterAuthorizerHost).post('/create_session')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_create_session.json'));
      expectedNetworkRequests.push(nock(voterAuthorizerHost).post('/request_authorization')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_request_authorization.json'));
      expectedNetworkRequests.push(nock(OTPProviderHost).post('/authorize')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_authorize.json'));
      expectedNetworkRequests.push(nock(bulletinBoardHost).post('/mobile-api/us/register')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_us_app_register.json'));
      expectedNetworkRequests.push(nock(bulletinBoardHost).post('/mobile-api/us/challenge_empty_cryptograms')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_us_app_challenge_empty_cryptograms.json'));
      expectedNetworkRequests.push(nock(bulletinBoardHost).get('/mobile-api/us/get_latest_board_hash')
        .replyWithFile(200, __dirname + '/replies/otp_flow/get_us_app_get_latest_board_hash.json'));
      expectedNetworkRequests.push(nock(bulletinBoardHost).post('/mobile-api/us/submit_votes')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_us_app_submit_votes.json'));
    } else {
      resetBackendData();
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
    // return await recordResponses(async function() {
      const client = new AVClient('http://us-avx:3000/mobile-api/us');
      await client.initialize()

      const voterId = '123456789012';
      await client.requestAccessCode(voterId, `us-voter-${voterId}@aion.dk`).catch((e) => {
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

      // We expect CVR value to look something like this: { '1': 'option1', '2': 'optiona' }
      const firstChoicesAsCVR = Object.fromEntries(client.getElectionConfig().ballots.map((ballot: any) =>
        [
          ballot.id,
          ballot.options[0].handle
        ]
      ));

      const trackingCode = await client.constructBallotCryptograms(firstChoicesAsCVR).catch((e) => {
        console.error(e);
        expect.fail('AVClient#constructBallotCryptograms failed');
      });
      expect(trackingCode.length).to.eql(64)

      const affidavit = Buffer.from('some bytes, most likely as binary PDF').toString('base64');
      const receipt = await client.submitBallotCryptograms(affidavit);

      expect(receipt).to.have.keys(
        'boardHash',
        'previousBoardHash',
        'registeredAt',
        'serverSignature',
        'voteSubmissionId'
      )
      expect(receipt.previousBoardHash.length).to.eql(64)

      if(USE_MOCK)
        expectedNetworkRequests.forEach((mock) => mock.done());
    // });
  });

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

  function resetBackendData() {
    if (!process.env['AVX_DIRECTORY']) {
      throw new Error('Check .env.example on how to provide AVX_DIRECTORY environment variable');
    }
    const scriptPath = path.join(
      process.env.AVX_DIRECTORY,
      'db',
      'development'
    )
    execSync(
      './reset_us_seed.sh',
      {
        cwd: scriptPath,
        stdio: 'inherit'
      }
    );
  }
});
