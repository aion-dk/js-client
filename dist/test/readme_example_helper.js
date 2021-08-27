"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readmeTestTeardown = exports.readmeTestSetup = void 0;
const nock = require("nock");
const test_helpers_1 = require("./test_helpers");
const sinon = require("sinon");
const sjcl = require('../lib/av_client/sjcl');
const Crypto = require('../lib/av_client/aion_crypto.js')();
let sandbox;
function readmeTestSetup() {
    sandbox = sinon.createSandbox();
    sandbox.stub(Math, 'random').callsFake(test_helpers_1.deterministicMathRandom);
    sandbox.stub(sjcl.prng.prototype, 'randomWords').callsFake(test_helpers_1.deterministicRandomWords);
    test_helpers_1.resetDeterministicOffset();
    nock('http://localhost:3000/').get('/test/app/config')
        .replyWithFile(200, __dirname + '/replies/otp_flow/get_config.json');
    nock('http://localhost:1234/').post('/create_session')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_create_session.json');
    nock('http://localhost:1234/').post('/start_identification')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_start_identification.json');
    nock('http://localhost:1111/').post('/authorize')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_authorize.json');
    nock('http://localhost:3000/').post('/test/app/register')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_register.json');
    nock('http://localhost:3000/').post('/test/app/challenge_empty_cryptograms')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_challenge_empty_cryptograms.json');
    nock('http://localhost:3000/').get('/test/app/get_latest_board_hash')
        .replyWithFile(200, __dirname + '/replies/otp_flow/get_get_latest_board_hash.json');
    nock('http://localhost:3000/').post('/test/app/submit_votes')
        .replyWithFile(200, __dirname + '/replies/otp_flow/post_submit_votes.json');
}
exports.readmeTestSetup = readmeTestSetup;
function readmeTestTeardown() {
    sandbox.restore();
    nock.cleanAll();
}
exports.readmeTestTeardown = readmeTestTeardown;
//# sourceMappingURL=readme_example_helper.js.map