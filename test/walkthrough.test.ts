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
import { BallotConfig, BallotSelection, ContestConfig, ContestConfigMap, ContestSelection } from '../lib/av_client/types';

const USE_MOCK = false;

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

  it.only('returns a receipt', async () => {
    // For recording, remember to reset AVX database and update oneTimePassword fixture value
    const performTest = async () => {
      const client = new AVClient(bulletinBoardHost + 'us');
      await client.initialize(undefined, {
        privateKey: 'bcafc67ca4af6b462f60d494adb675d8b1cf57b16dfd8d110bbc2453709999b0',
        publicKey: '03b87d7fe793a621df27f44c20f460ff711d55545c58729f20b3fb6e871c53c49c'
      });

      const voterId = `B0000000000${Math.random()}`
      const voterEmail = 'markitmarchtest@osetinstitute.org'
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
      const ballotConfig = client.getVoterBallotConfig()
      const ballotSelection = dummyBallotSelection(ballotConfig, contestConfigs)

      const _trackingCode = await client.constructBallot(ballotSelection).catch((e) => {
        console.error(e);
        expect.fail('AVClient#constructBallotCryptograms failed');
      });
      // expect(trackingCode.length).to.eql(64)

      const affidavit = Buffer.from('some bytes, most likely as binary PDF').toString('base64');
      const receipt = await client.castBallot(affidavit);
      expect(receipt.trackingCode.length).to.eql(7)

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


function dummyBallotSelection( ballotConfig: BallotConfig, contestConfigs: ContestConfigMap ): BallotSelection {
  return {
    reference: ballotConfig.reference,
    contestSelections: ballotConfig.contestReferences.map(cr => dummyContestSelection(contestConfigs[cr]))
  }
}

function dummyContestSelection( contestConfig: ContestConfig ): ContestSelection {
  return {
    reference: contestConfig.reference,
    optionSelections: [
      { reference: contestConfig.options[0].reference }
    ]
  }
}
