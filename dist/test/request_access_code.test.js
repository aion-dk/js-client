"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const av_client_1 = require("../lib/av_client");
const chai_1 = require("chai");
const nock = require("nock");
const test_helpers_1 = require("./test_helpers");
const sinon = require("sinon");
const sjcl = require('../lib/av_client/sjcl');
const Crypto = require('../lib/av_client/aion_crypto.js')();
describe('AVClient#requestAccessCode', function () {
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
        client = new av_client_1.AVClient('http://localhost:3000/test/app');
        await client.initialize();
    });
    afterEach(function () {
        sandbox.restore();
        nock.cleanAll();
    });
    context('OTP services work', function () {
        it('resolves without errors', async function () {
            expectedNetworkRequests.push(nock('http://localhost:1234/').post('/create_session')
                .reply(200));
            expectedNetworkRequests.push(nock('http://localhost:1234/').post('/start_identification')
                .reply(200));
            const opaqueVoterId = 'voter123';
            return client.requestAccessCode(opaqueVoterId).then((result) => {
                chai_1.expect(result).to.eql(undefined);
                expectedNetworkRequests.forEach((mock) => mock.done());
            }, (error) => {
                console.error(error);
                chai_1.expect.fail('Expected a resolved promise');
            });
        });
    });
    context('OTP service is unavailable', function () {
        it('returns an error', async function () {
            expectedNetworkRequests.push(nock('http://localhost:1234/').post('/create_session')
                .reply(404));
            const opaqueVoterId = 'voter123';
            return await client.requestAccessCode(opaqueVoterId).then(() => chai_1.expect.fail('Expected promise to be rejected'), (error) => {
                chai_1.expect(error.message).to.equal('Request failed with status code 404');
                expectedNetworkRequests.forEach((mock) => mock.done());
            });
        });
    });
});
//# sourceMappingURL=request_access_code.test.js.map