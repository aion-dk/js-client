import axios from 'axios';
import nock = require('nock');
import { resetDeterminism } from './test_helpers';
import { bulletinBoardHost, voterAuthorizerHost, OTPProviderHost, mailcatcherHost } from './test_helpers'
import { prepareRecording } from './mock_helpers'

import { AVVerifier } from '../lib/av_verifier';
import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import { BallotConfig, BallotSelection, ContestConfig, ContestConfigMap, ContestSelection } from '../lib/av_client/types';

const USE_MOCK = true;

const { useRecordedResponse, recordable } = prepareRecording('benaloh_flow')

describe('entire benaloh flow', () => {
  let sandbox;
  let expectedNetworkRequests : nock.Scope[] = [];

  beforeEach(() => {
    sandbox = resetDeterminism();
    if(USE_MOCK) {
      expectedNetworkRequests = [
        useRecordedResponse(bulletinBoardHost, 'get', '/us/configuration'),
        useRecordedResponse(bulletinBoardHost, 'get', '/us/configuration'),
        useRecordedResponse(voterAuthorizerHost, 'post', '/create_session'),
        useRecordedResponse(voterAuthorizerHost, 'post', '/request_authorization'),
        useRecordedResponse(OTPProviderHost, 'post', '/authorize'),
        useRecordedResponse(bulletinBoardHost, 'post', '/us/voting/registrations'),
        useRecordedResponse(bulletinBoardHost, 'post', '/us/voting/commitments'),
        useRecordedResponse(bulletinBoardHost, 'post', '/us/voting/votes'),
        useRecordedResponse(bulletinBoardHost, 'post', '/us/voting/spoil'),
        useRecordedResponse(bulletinBoardHost, 'post', '/us/verification/verifiers'),
        useRecordedResponse(bulletinBoardHost, 'get', '/us/verification/vote_track'),
        useRecordedResponse(bulletinBoardHost, 'get', '/us/verification/verifiers/40f90b541e72f54a955374113208fb40cb884dda7953f47d2c2714d816afea19'),
        useRecordedResponse(bulletinBoardHost, 'get', '/us/verification/spoil_status'),
        useRecordedResponse(bulletinBoardHost, 'get', '/us/verification/commitment_openings'),
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
    const verifier = new AVVerifier(bulletinBoardHost + '6');
    const client = new AVClient(bulletinBoardHost + '6');

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

    const [verfierPairingCode] = await Promise.all([pollForSpoilPromise]);

    // The verifier found a spoil request and now submits it's public key in a VerifierItem
    const clientPairingCode = await client.waitForVerifierRegistration()

    const verifierPairingCode = verfierPairingCode

    // Emulating a pairing the app and verifier tracking codes
    expect(verifierPairingCode).to.eql(clientPairingCode)

    // App creates the voterCommitmentOpening
    await client.challengeBallot()

    await verifier.pollForCommitmentOpening()
    // The verifier decrypts the ballot
    const contestSelections = verifier.decryptBallot();

    expect(contestSelections).to.eql([
      {
        reference: 'contest ref 1',
        optionSelections: [{reference: 'option ref 1'}]
      },{
        reference: 'contest ref 2',
        optionSelections: [{reference: 'option ref 3'}]
      }
    ]);

    const readableContestSelections = verifier.getReadableContestSelections(contestSelections, "en")

    expect(readableContestSelections).to.deep.equal([
      {
        "reference": "contest ref 1",
        "title": "First ballot",
        "optionSelections": [
          {
            "reference": "option ref 1",
            "title": "Option 1"
          }
        ]
      },
      {
        "reference": "contest ref 2",
        "title": "Second ballot",
        "optionSelections": [
          {
            "reference": "option ref 3",
            "title": "Option 3"
          }
        ]
      }
    ]);

    if( USE_MOCK ) expectedNetworkRequests.forEach((mock) => mock.done());

  })).timeout(10000);

  async function placeVote(client: AVClient) {
    const voterId = 'B00000000001'
    const voterEmail = 'markitmarchtest@osetinstitute.org'
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
    const ballotConfig = client.getVoterBallotConfig()
    const ballotSelection = dummyBallotSelection(ballotConfig, contestConfigs)

    const trackingCode = await client.constructBallot(ballotSelection).catch((e) => {
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
