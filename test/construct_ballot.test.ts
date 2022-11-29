import { AVClient } from '../lib/av_client';
import { CorruptSelectionError } from '../lib/av_client/errors';
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
import { BallotSelection } from '../lib/av_client/types';

describe('AVClient#constructBallot', () => {
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

  // context('given previous steps succeeded, and it receives valid values', () => {
  //   it('encrypts correctly', async () => {
  //     await client.requestAccessCode('voter123', 'voter@foo.bar');
  //     await client.validateAccessCode('1234');
  //     await client.registerVoter()

  //     const ballotSelection: BallotSelection = {
  //       reference: 'precinct_4_bedrock',
  //       contestSelections: [
  //         {
  //           reference: 'contest ref 1',
  //           optionSelections: [{reference: 'option ref 1'}]          
  //         },
  //         {
  //           reference: 'contest ref 2',
  //           optionSelections: [{reference: 'option ref 3'}]
  //         }
  //       ]
  //     }

  //     const trackingCode = await client.constructBallot(ballotSelection);

  //     expect(typeof trackingCode === "string").to.be.true;
  //   });
  // });

  // context('given invalid ballot selection', () => {
  //   context('when ballot selection reference is not matching voter group', () => {
  //     it('throws corrupt selection error', async () => {
  //       await client.requestAccessCode('voter123', 'voter@foo.bar')
  //       await client.validateAccessCode('1234')
  //       await client.registerVoter()

  //       const ballotSelection: BallotSelection = {
  //         reference: 'bogus ballot reference',
  //         contestSelections: [
  //           {
  //             reference: 'contest ref 1',
  //             optionSelections: [{reference: 'option ref 1'}]          
  //           },
  //           {
  //             reference: 'contest ref 2',
  //             optionSelections: [{reference: 'option ref 3'}]
  //           }
  //         ]
  //       }

  //       await expectError(
  //         client.constructBallot(ballotSelection),
  //         CorruptSelectionError,
  //         'Ballot selection does not match ballot config'
  //       )
  //     })
  //   })

  //   context('when ballot selection references a contest not on the ballot', () => {
  //     it('throws corrupt selection error', async () => {
  //       await client.requestAccessCode('voter123', 'voter@foo.bar')
  //       await client.validateAccessCode('1234')
  //       await client.registerVoter()

  //       const ballotSelection: BallotSelection = {
  //         reference: 'precinct_4_bedrock',
  //         contestSelections: [
  //           {
  //             reference: 'contest ref 1',
  //             optionSelections: [{reference: 'option ref 1'}]          
  //           },
  //           {
  //             reference: 'contest ref 3',
  //             optionSelections: [{reference: 'option ref 3'}]
  //           }
  //         ]
  //       }

  //       await expectError(
  //         client.constructBallot(ballotSelection),
  //         CorruptSelectionError,
  //         'Contest selections do not match the contests allowed by the ballot'
  //       )
  //     })
  //   })

  //   context('when voting for invalid option', () => {
  //     it('throws corrupt selection error', async () => {
  //       await client.requestAccessCode('voter123', 'voter@foo.bar')
  //       await client.validateAccessCode('1234')
  //       await client.registerVoter()

  //       const ballotSelection: BallotSelection = {
  //         reference: 'precinct_4_bedrock',
  //         contestSelections: [
  //           {
  //             reference: 'contest ref 1',
  //             optionSelections: [{reference: 'option ref 1'}]          
  //           },
  //           {
  //             reference: 'contest ref 2',
  //             optionSelections: [{reference: 'bogus option reference'}]
  //           }
  //         ]
  //       }

  //       await expectError(
  //         client.constructBallot(ballotSelection),
  //         CorruptSelectionError,
  //         'Option config not found'
  //       )
  //     })
  //   })
  // })
})
