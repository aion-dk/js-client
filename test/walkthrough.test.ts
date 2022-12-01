import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import axios from 'axios';
import {
  resetDeterminism,
  bulletinBoardHost,
  mailcatcherHost,
} from './test_helpers';
import { BallotConfig, BallotSelection, ContestConfig, ContestConfigMap, ContestSelection } from '../lib/av_client/types';

describe.skip('entire voter flow using OTP authorization', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = resetDeterminism()
  });

  afterEach(() => {
    sandbox.restore()
  });

  it('returns a receipt', async () => {
    const _performTest = async () => {
      const client = new AVClient(bulletinBoardHost + 'us');
      await client.initialize(undefined, {
        privateKey: 'bcafc67ca4af6b462f60d494adb675d8b1cf57b16dfd8d110bbc2453709999b0',
        publicKey: '03b87d7fe793a621df27f44c20f460ff711d55545c58729f20b3fb6e871c53c49c'
      });

      const voterId = Math.random().toString()
      const voterEmail = 'markitmarchtest@osetinstitute.org'
      await client.requestAccessCode(voterId, voterEmail).catch((e) => {
        console.error(e);
        expect.fail('AVClient#requestAccessCode failed.');
      });

      const oneTimePassword: string = await extractOTPFromEmail();

      const _confirmationToken = await client.validateAccessCode(oneTimePassword).catch((e) => {
        console.error(e);
        expect.fail('AVClient#validateAccessCode failed');
      });

      await client.registerVoter().catch((e) => {
        console.error(e);
        expect.fail('AVClient#registerVoter failed');
      })
      const { items: { contestConfigs } } = client.getLatestConfig()
      const ballotConfig = client.getVoterBallotConfig()
      const ballotSelection = dummyBallotSelection(ballotConfig, contestConfigs)

      const _trackingCode = await client.constructBallot(ballotSelection).catch((e) => {
        console.error(e);
        expect.fail('AVClient#constructBallotCryptograms failed');
      });

      const affidavit = Buffer.from('some bytes, most likely as binary PDF').toString('base64');
      const receipt = await client.castBallot(affidavit);
      expect(receipt.trackingCode.length).to.eql(7);

      await _performTest();
    }
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

describe.skip('entire voter flow using PoEC authorization', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = resetDeterminism();
  });

  afterEach(() => {
    sandbox.restore()
  });

  it('returns a receipt', async () => {
    const _performTest = async () => {
      const client = new AVClient(bulletinBoardHost + '2904b00f_5abcbf894df3_58');
      await client.initialize(undefined, {
        privateKey: 'a259f4b44e30abc0cd53379381bdc86f44723911a5bc03bf4ff21d1b49b53efd',
        publicKey: '0290d410a7d25411bdd3d82ace5f707d02c054b60e7dc8883c1f07be4265704dd6'
      });

      client.generateProofOfElectionCodes(['1']);

      await client.registerVoter().catch((e) => {
        console.error(e);
        expect.fail('AVClient#registerVoter failed');
      })
      const { items: { contestConfigs } } = client.getLatestConfig()
      const ballotConfig = client.getVoterBallotConfig()
      const ballotSelection = dummyBallotSelection(ballotConfig, contestConfigs)

      const _trackingCode = await client.constructBallot(ballotSelection).catch((e) => {
        console.error(e);
        expect.fail('AVClient#constructBallotCryptograms failed');
      });

      const affidavit = Buffer.from('some bytes, most likely as binary PDF').toString('base64');
      const receipt = await client.castBallot(affidavit);
      expect(receipt.trackingCode.length).to.eql(7)

      await _performTest();
    }
  }).timeout(10000);
})

function dummyBallotSelection( ballotConfig: BallotConfig, contestConfigs: ContestConfigMap ): BallotSelection {
  return {
    reference: ballotConfig.content.reference,
    contestSelections: ballotConfig.content.contestReferences.map(cr => dummyContestSelection(contestConfigs[cr]))
  }
}

function dummyContestSelection( contestConfig: ContestConfig ): ContestSelection {
  return {
    reference: contestConfig.content.reference,
    optionSelections: [
      { reference: contestConfig.content.options[0].reference }
    ]
  }
}
