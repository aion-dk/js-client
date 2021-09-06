"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const av_client_1 = require("../lib/av_client");
const chai_1 = require("chai");
const nock = require("nock");
const test_helpers_1 = require("./test_helpers");
const sinon = require("sinon");
const errors_1 = require("../lib/av_client/errors");
const sjcl = require('../lib/av_client/sjcl');
const Crypto = require('../lib/av_client/aion_crypto.js')();
describe('AVClient#validateAccessCode', () => {
    let client;
    let sandbox;
    const expectedNetworkRequests = [];
    beforeEach(async () => {
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
        client = new av_client_1.AVClient('http://localhost:3000/test/app');
        await client.initialize();
    });
    afterEach(() => {
        sandbox.restore();
        nock.cleanAll();
    });
    context('OTP services work', () => {
        it('resolves without errors', async () => {
            expectedNetworkRequests.push(nock('http://localhost:1111/').post('/authorize')
                .replyWithFile(200, __dirname + '/replies/otp_flow/post_authorize.json'));
            expectedNetworkRequests.push(nock('http://localhost:1234/').post('/request_authorization')
                .replyWithFile(200, __dirname + '/replies/otp_flow/post_request_authorization.json'));
            expectedNetworkRequests.push(nock('http://localhost:3000/').post('/test/app/register')
                .replyWithFile(200, __dirname + '/replies/otp_flow/post_register.json'));
            expectedNetworkRequests.push(nock('http://localhost:3000/').post('/test/app/challenge_empty_cryptograms')
                .replyWithFile(200, __dirname + '/replies/otp_flow/post_challenge_empty_cryptograms.json'));
            const otp = '1234';
            const email = 'blabla@aion.dk';
            await client.requestAccessCode('voter123', email);
            const result = await client.validateAccessCode(otp);
            await client.registerVoter();
            chai_1.expect(result).to.equal(undefined);
            expectedNetworkRequests.forEach((mock) => mock.done());
        });
        it('fails given invalid otps', async () => {
            expectedNetworkRequests.push(nock('http://localhost:1111/').post('/authorize')
                .replyWithFile(403, __dirname + '/replies/otp_provider_authorize.invalid.json'));
            const otp = '0000';
            const email = 'blabla@aion.dk';
            await client.requestAccessCode('voter123', email);
            return client.validateAccessCode(otp).then(() => chai_1.expect.fail('Expected promise to be rejected'), (error) => {
                chai_1.expect(error).to.be.an.instanceof(errors_1.AccessCodeInvalid);
                chai_1.expect(error.message).to.equal('OTP code invalid');
            });
            expectedNetworkRequests.forEach((mock) => mock.done());
        });
        it('fails given expired otp', async function () {
            expectedNetworkRequests.push(nock('http://localhost:1111/').post('/authorize')
                .replyWithFile(403, __dirname + '/replies/otp_provider_authorize.expired.json'));
            const otp = '1234';
            const email = 'blabla@aion.dk';
            await client.requestAccessCode('voter123', email);
            return client.validateAccessCode(otp).then(() => {
                chai_1.expect.fail('Expected promise to be rejected');
            }, (error) => {
                chai_1.expect(error).to.be.an.instanceof(errors_1.AccessCodeExpired);
                chai_1.expect(error.message).to.equal('OTP code expired');
            });
            expectedNetworkRequests.forEach((mock) => mock.done());
        });
    });
    context('OTP services is unavailable', function () {
        it('returns network error on timeout', async function () {
            expectedNetworkRequests.push(nock('http://localhost:1111/').post('/authorize')
                .replyWithError({ code: 'ETIMEDOUT' }));
            const otp = '1234';
            await client.requestAccessCode('voter123', 'blabla@aion.dk');
            return client.validateAccessCode(otp).then(() => {
                chai_1.expect.fail('Expected promise to be rejected');
            }, (error) => {
                chai_1.expect(error).to.be.an.instanceof(errors_1.NetworkError);
                chai_1.expect(error.message).to.equal('Network error');
            });
        });
        it('returns network error on host not available', async function () {
            const otp = '1234';
            const email = 'blabla@aion.dk';
            await client.initialize({
                ...client.getElectionConfig(),
                OTPProviderURL: 'http://sdkghskfglksjlkfgjdlkfjglkdfjglkjdlfgjlkdjgflkjdlkfgjlkdfg.com'
            });
            await client.requestAccessCode('voter123', 'blabla@aion.dk');
            return client.validateAccessCode(otp).then(() => {
                chai_1.expect.fail('Expected promise to be rejected');
            }, (error) => {
                chai_1.expect(error).to.be.an.instanceof(errors_1.NetworkError);
                chai_1.expect(error.message).to.equal('Network error');
            });
        });
    });
});
//# sourceMappingURL=validate_access_code.test.js.map