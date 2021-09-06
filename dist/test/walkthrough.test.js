"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const av_client_1 = require("../lib/av_client");
const chai_1 = require("chai");
const nock = require("nock");
const test_helpers_1 = require("./test_helpers");
const sinon = require("sinon");
const sjcl = require('../lib/av_client/sjcl');
const Crypto = require('../lib/av_client/aion_crypto.js')();
describe('entire voter flow using OTP authorization', () => {
    let sandbox;
    let expectedNetworkRequests = [];
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.stub(Math, 'random').callsFake(test_helpers_1.deterministicMathRandom);
        sandbox.stub(sjcl.prng.prototype, 'randomWords').callsFake(test_helpers_1.deterministicRandomWords);
        test_helpers_1.resetDeterministicOffset();
        expectedNetworkRequests.push(nock('http://localhost:3000/').get('/test/app/config')
            .replyWithFile(200, __dirname + '/replies/otp_flow/get_config.json'));
        expectedNetworkRequests.push(nock('http://localhost:1234/').post('/create_session')
            .replyWithFile(200, __dirname + '/replies/otp_flow/post_create_session.json'));
        expectedNetworkRequests.push(nock('http://localhost:1234/').post('/start_identification')
            .replyWithFile(200, __dirname + '/replies/otp_flow/post_start_identification.json'));
        expectedNetworkRequests.push(nock('http://localhost:1234/').post('/request_authorization')
            .replyWithFile(200, __dirname + '/replies/otp_flow/post_request_authorization.json'));
        expectedNetworkRequests.push(nock('http://localhost:1111/').post('/authorize')
            .replyWithFile(200, __dirname + '/replies/otp_flow/post_authorize.json'));
        expectedNetworkRequests.push(nock('http://localhost:3000/').post('/test/app/register')
            .replyWithFile(200, __dirname + '/replies/otp_flow/post_register.json'));
        expectedNetworkRequests.push(nock('http://localhost:3000/').post('/test/app/challenge_empty_cryptograms')
            .replyWithFile(200, __dirname + '/replies/otp_flow/post_challenge_empty_cryptograms.json'));
        expectedNetworkRequests.push(nock('http://localhost:3000/').get('/test/app/get_latest_board_hash')
            .replyWithFile(200, __dirname + '/replies/otp_flow/get_get_latest_board_hash.json'));
        expectedNetworkRequests.push(nock('http://localhost:3000/').post('/test/app/submit_votes')
            .replyWithFile(200, __dirname + '/replies/otp_flow/post_submit_votes.json'));
    });
    afterEach(() => {
        sandbox.restore();
        nock.cleanAll();
    });
    it('returns a receipt', async () => {
        const client = new av_client_1.AVClient('http://localhost:3000/test/app');
        await client.initialize();
        await client.requestAccessCode('voter123', 'voter@foo.bar').catch((e) => {
            console.error(e);
            chai_1.expect.fail('AVClient#requestAccessCode failed.');
        });
        const confirmationToken = await client.validateAccessCode('1234').catch((e) => {
            console.error(e);
            chai_1.expect.fail('AVClient#validateAccessCode failed');
        });
        await client.registerVoter().catch((e) => {
            console.error(e);
            chai_1.expect.fail('AVClient#registerVoter failed');
        });
        const cvr = { '1': 'option1', '2': 'optiona' };
        const trackingCode = await client.constructBallotCryptograms(cvr).catch((e) => {
            console.error(e);
            chai_1.expect.fail('AVClient#constructBallotCryptograms failed');
        });
        chai_1.expect(trackingCode).to.eql('da46ec752fd9197c0d77e6d843924b082b8b23350e8ac5fd454051dc1bf85ad2');
        const affidavit = 'some bytes, most likely as binary PDF';
        const receipt = await client.submitBallotCryptograms(affidavit).catch((e) => {
            console.error(e);
            chai_1.expect.fail('AVClient#submitBallotCryptograms failed');
        });
        chai_1.expect(receipt).to.eql({
            previousBoardHash: 'd8d9742271592d1b212bbd4cbbbe357aef8e00cdbdf312df95e9cf9a1a921465',
            boardHash: '87abbdea83326ba124a99f8f56ba4748f9df97022a869c297aad94c460804c03',
            registeredAt: '2020-03-01T10:00:00.000+01:00',
            serverSignature: 'bfaffbaf8778abce29ea98ebc90ca91e091881480e18ef31da815d181cead1f6,8977ad08d4fc3b1d9be311d93cf8e98178142685c5fbbf703abf2188a8d1c862',
            voteSubmissionId: 6
        });
        expectedNetworkRequests.forEach((mock) => mock.done());
    });
});
//# sourceMappingURL=walkthrough.test.js.map