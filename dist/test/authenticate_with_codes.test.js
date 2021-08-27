"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const av_client_1 = require("../lib/av_client");
const chai_1 = require("chai");
const nock = require("nock");
const test_helpers_1 = require("./test_helpers");
const sinon = require("sinon");
const sjcl = require('../lib/av_client/sjcl');
describe('AVClient#authenticateWithCodes', function () {
    let client;
    let sandbox;
    beforeEach(function () {
        client = new av_client_1.AVClient('http://localhost:3000/test/app');
        sandbox = sinon.createSandbox();
        sandbox.stub(Math, 'random').callsFake(test_helpers_1.deterministicMathRandom);
        sandbox.stub(sjcl.prng.prototype, 'randomWords').callsFake(test_helpers_1.deterministicRandomWords);
        test_helpers_1.resetDeterministicOffset();
    });
    afterEach(function () {
        sandbox.restore();
        nock.cleanAll();
    });
    context('given valid election codes', function () {
        beforeEach(function () {
            nock('http://localhost:3000/').get('/test/app/config')
                .replyWithFile(200, __dirname + '/replies/config.valid.json');
            nock('http://localhost:3000/').post('/test/app/sign_in')
                .replyWithFile(200, __dirname + '/replies/sign_in.valid.json');
            nock('http://localhost:3000/').post('/test/app/challenge_empty_cryptograms')
                .replyWithFile(200, __dirname + '/replies/challenge_empty_cryptograms.valid.json');
        });
        it('returns success', async function () {
            const validCodes = ['aAjEuD64Fo2143'];
            const result = await client.authenticateWithCodes(validCodes);
            chai_1.expect(result).to.equal('OK');
        });
    });
    context('given invalid election codes', function () {
        beforeEach(function () {
            nock('http://localhost:3000/').get('/test/app/config')
                .replyWithFile(200, __dirname + '/replies/config.valid.json');
            nock('http://localhost:3000/').post('/test/app/sign_in')
                .replyWithFile(200, __dirname + '/replies/avx_error.invalid_3.json');
        });
        it('returns an error', async function () {
            const invalidCodes = ['no', 'no'];
            return client.authenticateWithCodes(invalidCodes).then(() => chai_1.expect.fail('Expected promise to be rejected'), (error) => chai_1.expect(error).to.equal('No ballots found for the submitted election codes'));
        });
    });
});
//# sourceMappingURL=authenticate_with_codes.test.js.map