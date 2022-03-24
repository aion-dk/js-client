import axios from 'axios';
import nock = require('nock');
import { resetDeterminism } from './test_helpers';
import { bulletinBoardHost, voterAuthorizerHost, OTPProviderHost, mailcatcherHost } from './test_helpers'
import { prepareRecording } from './mock_helpers'

import { AVVerifier } from '../lib/av_verifier';
import { AVClient } from '../lib/av_client';
import { expect } from 'chai';

const USE_MOCK = true;

const { useRecordedResponse, recordable } = prepareRecording('benaloh_flow')

describe('entire benaloh flow', () => {
  let sandbox;
  let expectedNetworkRequests : nock.Scope[] = [];

  beforeEach(() => {
    sandbox = resetDeterminism();
    if(USE_MOCK) {
      expectedNetworkRequests = [
        useRecordedResponse(bulletinBoardHost, 'get', '/dbb/us/api/election_config'),
        useRecordedResponse(bulletinBoardHost, 'get', '/dbb/us/api/election_config'),
        useRecordedResponse(voterAuthorizerHost, 'post', '/create_session'),
        useRecordedResponse(voterAuthorizerHost, 'post', '/request_authorization'),
        useRecordedResponse(OTPProviderHost, 'post', '/authorize'),
        useRecordedResponse(bulletinBoardHost, 'post', '/dbb/us/api/registrations'),
        useRecordedResponse(bulletinBoardHost, 'post', '/dbb/us/api/commitments'),
        useRecordedResponse(bulletinBoardHost, 'post', '/dbb/us/api/votes'),
        useRecordedResponse(bulletinBoardHost, 'post', '/dbb/us/api/spoil'),
        useRecordedResponse(bulletinBoardHost, 'post', '/dbb/us/api/verification/verifier'),

        // NOTE! The following requests need to be updated when a new recordings are done.
        useRecordedResponse(bulletinBoardHost, 'get', '/dbb/us/api/verification/vote_track'),
        useRecordedResponse(bulletinBoardHost, 'get', '/dbb/us/api/verification/verifier'),
        useRecordedResponse(bulletinBoardHost, 'get', '/dbb/us/api/verification/spoil_status'),
        useRecordedResponse(bulletinBoardHost, 'get', '/dbb/us/api/verification/commitment_openings'),
      ];
    }
  });

  afterEach(() => {
    sandbox.restore()
    if (USE_MOCK) {
      nock.cleanAll();
    }
  });

  it('spoils a ballot', recordable(USE_MOCK, async () => {
    const verifier = new AVVerifier(bulletinBoardHost + 'dbb/us/api');
    const client = new AVClient(bulletinBoardHost + 'dbb/us/api');

    await verifier.initialize()
    await client.initialize(undefined, {
      privateKey: 'bcafc67ca4af6b462f60d494adb675d8b1cf57b16dfd8d110bbc2453709999b0',
      publicKey: '03b87d7fe793a621df27f44c20f460ff711d55545c58729f20b3fb6e871c53c49c'
    });

    const trackingCode = await placeVote(client) as string
    await verifier.findBallot(trackingCode)

    // The verifier starts polling for spoil request
    const pollForSpoilPromise = verifier.pollForSpoilRequest()
      .then(verifierSpoilRequestAddress => {
        return verifier.submitVerifierKey(verifierSpoilRequestAddress)
      })

    await client.spoilBallot();

    const [verifierItem] = await Promise.all([pollForSpoilPromise]);

    // The verifier found a spoil request and now submits it's public key in a VerifierItem
    const veriferAddress = await client.waitForVerifierRegistration()

    // Emulating a pairing the app and verifier tracking codes
    expect(verifierItem.shortAddress).to.eql(veriferAddress)

    // App creates the voterCommitmentOpening
    await client.challengeBallot()

    await verifier.pollForCommitmentOpening()
    // The verifier decrypts the ballot
    const votes = verifier.decryptBallot();

    expect(votes).to.eql({
      'contest ref 1': 'option ref 1',
      'contest ref 2': 'option ref 3'
    });

    if( USE_MOCK ) expectedNetworkRequests.forEach((mock) => mock.done());

  })).timeout(10000);

  it.skip('cannot spoil ballot because it has already been cast', async () => {
    // For recording, remember to reset AVX database and update oneTimePassword fixture value
    const performTest = async () => {
      // Setup
      const verifier = new AVVerifier(bulletinBoardHost + 'dbb/us/api');
      const client = new AVClient(bulletinBoardHost + 'dbb/us/api');
      const trackingCode = await placeVote(client) as string

      // Find ballot a ballot with corresponding tracking code
      const cryptogramAddress = await verifier.findBallot(trackingCode)

      // Casting ballot rather than spoiling
      await client.castBallot()

      // We should have found a ballot
      expect(cryptogramAddress.length).to.eql(64)

      // We should receive an error which tells us the ballot we are trying to spoil has already been cast
      const spoilRequest = await verifier.pollForSpoilRequest().catch(error => {
        expect(error.message).to.eql('Ballot has been cast and cannot be spoiled')
      })

      expect(spoilRequest).to.eql(undefined)
    }

    await performTest()
  }).timeout(10000);

  it.skip('finds a ballot but spoil request isnt registered in time', async () => {
    // For recording, remember to reset AVX database and update oneTimePassword fixture value
    const performTest = async () => {
      // Setup
      const verifier = new AVVerifier(bulletinBoardHost + 'dbb/us/api');
      const client = new AVClient(bulletinBoardHost + 'dbb/us/api');
      const trackingCode = await placeVote(client) as string
      // Find ballot a ballot with corresponding tracking code
      const cryptogramAddress = await verifier.findBallot(trackingCode)

      // We should have found a ballot
      expect(cryptogramAddress.length).to.eql(64)

      // We should receive an error which tells us the ballot we are looking for has no spoil request
      const spoilRequest = await verifier.pollForSpoilRequest().catch(error => {
        expect(error.message).to.eql('Exceeded max attempts')
      })

      expect(spoilRequest).to.eql(undefined)
    }
    
    await performTest()
      
  }).timeout(10000);

  async function placeVote(client: AVClient) {
    const voterId = 'A00000000006'
    const voterEmail = 'mvptuser@yahoo.com'
    await client.requestAccessCode(voterId, voterEmail).catch((e) => {
      console.error(e);
    });

    const oneTimePassword = USE_MOCK ? '12345' : await extractOTPFromEmail()
    await client.validateAccessCode(oneTimePassword).catch((e) => {
      console.error(e);
    });

    await client.registerVoter().catch((e) => {
      console.error(e);
    })
    const { contestConfigs } = client.getElectionConfig()
    // We expect CVR value to look something like this: { '1': 'option1', '2': 'optiona' }
    const contestsChoices = Object.keys(contestConfigs)
      .map((references: string) => [
        references,
        contestConfigs[references].options[0].reference
      ])

    const cvr = Object.fromEntries(contestsChoices)

    const trackingCode = await client.constructBallot(cvr).catch((e) => {
      console.error(e);
    });
    return trackingCode
  }

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

