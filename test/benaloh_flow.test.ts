import axios from 'axios';
import nock = require('nock');
import { resetDeterminism } from './test_helpers';
import { bulletinBoardHost, voterAuthorizerHost, OTPProviderHost } from './test_helpers'
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
    const verifier = new AVVerifier('http://us-avx:3000/dbb/us/api');
    const client = new AVClient('http://us-avx:3000/dbb/us/api');

    await verifier.initialize()
    await client.initialize(undefined, {
      privateKey: 'bcafc67ca4af6b462f60d494adb675d8b1cf57b16dfd8d110bbc2453709999b0',
      publicKey: '03b87d7fe793a621df27f44c20f460ff711d55545c58729f20b3fb6e871c53c49c'
    });

    const trackingCode = await placeVote(client) as string
    await verifier.findBallot(trackingCode)

    let verifierItem : any

    // The verifier starts polling for spoil request
    const pollForSpoilPromise = verifier.pollForSpoilRequest()
      .then(verifierSpoilRequestAddress => {
        return verifier.submitVerifierKey(verifierSpoilRequestAddress)
      })
      .then(item => verifierItem = item)

    await client.spoilBallot();

    await Promise.all([pollForSpoilPromise]);

    // The verifier found a spoil request and now submits it's public key in a VerifierItem
    const veriferAddress = await client.waitForVerifierRegistration()
      
    await Promise.all([pollForSpoilPromise]);

    // Emulating a pairing the app and verifier tracking codes
    expect(verifierItem.address).to.eql(veriferAddress)

    // App creates the voterCommitmentOpening
    await client.challengeBallot()

    await verifier.pollForCommitmentOpening()
    // The verifier decrypts the ballot
    const votes = verifier.decryptBallot();

    expect(votes).to.eql({
      'f7a04384-1458-5911-af38-7e08a46136e7': '1',
      '026ca870-537e-57b2-b313-9bb5d9fbe78b': '3'
    });

    if( USE_MOCK ) expectedNetworkRequests.forEach((mock) => mock.done());

  })).timeout(10000);

  it.skip('cannot spoil ballot because it has already been cast', async () => {
    // For recording, remember to reset AVX database and update oneTimePassword fixture value
    const performTest = async () => {
      // Setup
      const verifier = new AVVerifier('http://us-avx:3000/dbb/us/api');
      const client = new AVClient('http://us-avx:3000/dbb/us/api');
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
      const verifier = new AVVerifier('http://us-avx:3000/dbb/us/api');
      const client = new AVClient('http://us-avx:3000/dbb/us/api');
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
      .map((uuid: string) => [
        uuid,
        contestConfigs[uuid].options[0].handle
      ])

    const cvr = Object.fromEntries(contestsChoices)

    const trackingCode = await client.constructBallotCryptograms(cvr).catch((e) => {
      console.error(e);
    });
    return trackingCode
  }

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

