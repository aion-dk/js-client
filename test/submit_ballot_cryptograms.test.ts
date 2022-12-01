// /*eslint-disable @typescript-eslint/no-explicit-any*/
// import { AVClient } from '../lib/av_client';
// import { expect } from 'chai';
// import nock = require('nock');
// import {
//   expectError,
//   resetDeterminism,
//   bbHost,
//   vaHost,
//   otpHost,
//   bulletinBoardHost
// } from './test_helpers';
// import * as Crypto from '../lib/av_client/aion_crypto';
// import { BallotSelection } from '../lib/av_client/types';

// describe('AVClient#submitBallotCryptograms', () => {
//   let client: AVClient;
//   let sandbox;

//   beforeEach(async () => {
//     sandbox = resetDeterminism();

//     bbHost.get_election_config();
//     vaHost.post_create_session();
//     vaHost.post_request_authorization();
//     otpHost.post_authorize();
//     bbHost.post_registrations();

//     // DEPRECATED
//     // nock(bulletinBoardHost).post('/mobile-api/us/challenge_empty_cryptograms')
//     //   .replyWithFile(200, __dirname + '/replies/otp_flow/post_us_app_challenge_empty_cryptograms.json');
//     // nock(bulletinBoardHost).get('/mobile-api/us/get_latest_board_hash')
//     //   .replyWithFile(200, __dirname + '/replies/otp_flow/get_us_app_get_latest_board_hash.json');
//     // nock(bulletinBoardHost).post('/mobile-api/us/submit_votes')
//     //   .replyWithFile(200, __dirname + '/replies/otp_flow/post_us_app_submit_votes.json');

//     client = new AVClient(bulletinBoardHost + 'dbb/us/api');
//     await client.initialize()
//   });

//   afterEach( () => {
//     sandbox.restore();
//     nock.cleanAll();
//   })

//   context('given valid values', () => {
//     it('successfully submits encrypted votes', async () => {
//       await client.requestAccessCode('voter123', 'voter@foo.bar');
//       await client.validateAccessCode('1234');
//       await client.registerVoter();

//       const ballotSelection: BallotSelection = {
//         reference: 'ballot-1',
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

//       await client.constructBallot(ballotSelection)

//       const affidavit = Buffer.from('some bytes, most likely as binary PDF').toString('base64');
//       const receipt = await client.castBallot(affidavit);

//       expect(typeof receipt === "string").to.be.true;
//     });
//   });

//   // DEPRECATED DUE TO NEW BOARD STRUCTURE?
//   context('proof of correct encryption is corrupted', () => {
//     it('fails with an error message', async () => {
//       await client.requestAccessCode('voter123', 'voter@foo.bar');
//       await client.validateAccessCode('1234');
//       await client.registerVoter();

//       const ballotSelection: BallotSelection = {
//         reference: 'ballot-1',
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

//       await client.constructBallot(ballotSelection);

//       // change the proof of ballot 1
//       const randomness = 'corrupted_randomness!';

//       // TODO: Refactor to avoid manipulation of internal state
//       (client as any).voteEncryptions['1'].proof = Crypto.generateDiscreteLogarithmProof(randomness);

//       const affidavit = Buffer.from('some bytes, most likely as binary PDF').toString('base64');
//       await expectError(
//         client.castBallot(affidavit),
//         Error,
//         'Invalid vote receipt: corrupt board hash'
//       );
//     });
//   });
// });

export {}