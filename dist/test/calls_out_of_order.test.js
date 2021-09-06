"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const av_client_1 = require("../lib/av_client");
const chai_1 = require("chai");
const nock = require("nock");
const test_helpers_1 = require("./test_helpers");
const sinon = require("sinon");
const sjcl = require('../lib/av_client/sjcl');
describe('AVClient functions call order', () => {
    let client;
    beforeEach(() => {
        client = new av_client_1.AVClient('http://localhost:3000/test/app');
    });
    it('throws an error when validateAccessCode is called first', async () => {
        try {
            await client.validateAccessCode('1234');
            chai_1.expect.fail('Expected an InvalidStateError, got no error');
        }
        catch (e) {
            chai_1.expect(e.name).to.eql('InvalidStateError');
            chai_1.expect(e.message).to.eql('#validateAccessCode requires exactly #requestAccessCode to be called before it');
        }
    });
    it('throws an error when constructBallotCryptograms is called first', async () => {
        try {
            await client.constructBallotCryptograms({ '1': 'option1', '2': 'optiona' });
            chai_1.expect.fail('Expected an InvalidStateError, got no error');
        }
        catch (e) {
            chai_1.expect(e.name).to.eql('InvalidStateError');
            chai_1.expect(e.message).to.eql('#constructBallotCryptograms requires exactly #requestAccessCode, #validateAccessCode to be called before it');
        }
    });
    it('throws an error when spoilBallotCryptograms is called first', async () => {
        try {
            await client.spoilBallotCryptograms();
            chai_1.expect.fail('Expected an InvalidStateError, got no error');
        }
        catch (e) {
            chai_1.expect(e.name).to.eql('InvalidStateError');
            chai_1.expect(e.message).to.eql('#spoilBallotCryptograms requires exactly #requestAccessCode, #validateAccessCode, #constructBallotCryptograms to be called before it');
        }
    });
    it('throws an error when submitBallotCryptograms is called first', async () => {
        try {
            await client.submitBallotCryptograms('affidavit bytes');
            chai_1.expect.fail('Expected an InvalidStateError, got no error');
        }
        catch (e) {
            chai_1.expect(e.name).to.eql('InvalidStateError');
            chai_1.expect(e.message).to.eql('#submitBallotCryptograms requires exactly #requestAccessCode, #validateAccessCode, #constructBallotCryptograms to be called before it');
        }
    });
    context('submitBallotCryptograms is called directly after spoiling', () => {
        let sandbox;
        beforeEach(async () => {
            nock('http://localhost:3000/').get('/test/app/config')
                .replyWithFile(200, __dirname + '/replies/otp_flow/get_config.json');
            nock('http://localhost:1234/').post('/create_session')
                .replyWithFile(200, __dirname + '/replies/otp_flow/post_create_session.json');
            nock('http://localhost:1234/').post('/start_identification')
                .replyWithFile(200, __dirname + '/replies/otp_flow/post_start_identification.json');
            nock('http://localhost:1234/').post('/request_authorization')
                .replyWithFile(200, __dirname + '/replies/otp_flow/post_request_authorization.json');
            nock('http://localhost:1111/').post('/authorize')
                .replyWithFile(200, __dirname + '/replies/otp_flow/post_authorize.json');
            nock('http://localhost:3000/').post('/test/app/register')
                .replyWithFile(200, __dirname + '/replies/otp_flow/post_register.json');
            nock('http://localhost:3000/').post('/test/app/challenge_empty_cryptograms')
                .replyWithFile(200, __dirname + '/replies/otp_flow/post_challenge_empty_cryptograms.json');
            nock('http://localhost:3000/').get('/test/app/get_latest_board_hash')
                .replyWithFile(200, __dirname + '/replies/otp_flow/get_get_latest_board_hash.json');
            nock('http://localhost:3000/').post('/test/app/get_commitment_opening')
                .replyWithFile(200, __dirname + '/replies/get_commitment_opening.valid.json');
            client = new av_client_1.AVClient('http://localhost:3000/test/app');
            await client.initialize();
            sandbox = sinon.createSandbox();
            sandbox.stub(Math, 'random').callsFake(test_helpers_1.deterministicMathRandom);
            sandbox.stub(sjcl.prng.prototype, 'randomWords').callsFake(test_helpers_1.deterministicRandomWords);
            test_helpers_1.resetDeterministicOffset();
        });
        afterEach(() => {
            sandbox.restore();
            nock.cleanAll();
        });
        it('throws an error when submitBallotCryptograms is called directly after spoiling', async () => {
            await client.requestAccessCode('voter123');
            await client.validateAccessCode('1234', 'voter@foo.bar');
            await client.registerVoter();
            const cvr = { '1': 'option1', '2': 'optiona' };
            await client.constructBallotCryptograms(cvr);
            client.generateTestCode();
            await client.spoilBallotCryptograms();
            nock.cleanAll();
            try {
                await client.submitBallotCryptograms('affidavit bytes');
                chai_1.expect.fail('Expected an InvalidStateError, got no error');
            }
            catch (error) {
                chai_1.expect(error.name).to.eql('InvalidStateError');
                chai_1.expect(error.message).to.eql('#submitBallotCryptograms requires exactly #requestAccessCode, #validateAccessCode, #constructBallotCryptograms to be called before it');
            }
        });
    });
});
//# sourceMappingURL=calls_out_of_order.test.js.map