import { expect } from 'chai';
import nock = require('nock');
import sinon = require('sinon');
const fs = require('fs');
const sjcl = require('../lib/av_client/sjcl');

export const bulletinBoardHost = 'http://us-avx:3000/';
export const OTPProviderHost = 'http://otp-provider:1111/';
export const OTPProviderElectionContextId = 'cca2b217-cedd-4d58-a103-d101ba472eb8';
export const voterAuthorizerHost = 'http://authorizer:1234/';

export const bbHost = {
  get_election_config: () => nock(bulletinBoardHost)
      .get('/dbb/us/api/election_config')
      .replyWithFile(200, __dirname + '/replies/otp_flow/get_dbb_us_api_election_config.json'),

  post_registrations: () => nock(bulletinBoardHost)
      .post('/dbb/us/api/registrations')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_dbb_us_api_registrations.json'),

  post_commitments: () => nock(bulletinBoardHost)
      .post('/dbb/us/api/commitments')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_dbb_us_api_commitments.json'),

  post_votes: () => nock(bulletinBoardHost)
      .post('/dbb/us/api/votes')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_dbb_us_api_votes.json'),

  post_cast: () => nock(bulletinBoardHost)
      .post('/dbb/us/api/cast')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_dbb_us_api_cast.json')
};

export const vaHost = {
  post_create_session: () => nock(voterAuthorizerHost)
      .post('/create_session')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_create_session.json'),

  post_request_authorization: () => nock(voterAuthorizerHost)
      .post('/request_authorization')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_request_authorization.json')
}

export const otpHost = {
  post_authorize: () => nock(OTPProviderHost)
      .post('/authorize')
      .replyWithFile(200, __dirname + '/replies/otp_flow/post_authorize.json')
};

export function resetDeterminism() {
  const sandbox = sinon.createSandbox();
  sandbox.stub(Math, 'random').callsFake(deterministicMathRandom);
  sandbox.stub(sjcl.prng.prototype, 'randomWords').callsFake(deterministicRandomWords);
  resetDeterministicOffset();
  return sandbox;
}

export function deterministicRandomWords(nwords, _paranoia) {
  const lowestValidNumber = -2147483648;
  const highestValidNumber = 2147483647;

  if (typeof global.deterministicOffset == 'undefined') {
    resetDeterministicOffset();
  }

  let nextRandomInt = global.deterministicOffset;
  let output : number[] = []
  for (let i = 0; i < nwords; i++) {
    if (nextRandomInt > highestValidNumber) {
      nextRandomInt = lowestValidNumber
    }
    output.push(nextRandomInt++)
  }
  global.deterministicOffset++;

  return output
}

export function readJSON(path) {
  const data = fs.readFileSync(require.resolve(path));
  const json = JSON.parse(data);
  return json;
}

export function resetDeterministicOffset() {
  global.deterministicOffset = 0;
}

// Make Math.random deterministic when running tests
export function deterministicMathRandom() {
  return 0.42
}

export async function recordResponses(callback) {
  setupRecording();

  await callback.call()

  stopRecording();
  saveFiles();
  cleanup();
}

export async function expectError(promise: (Promise<any>|Function), errorType: any, message: string): Promise<any> {
  if (typeof promise == 'object') { // Async promise
    return promise
      .then(() => expect.fail('Expected promise to be rejected'))
      .catch(error => {
        expect(error).to.be.an.instanceof(errorType);
        expect(error.message).to.equal(message);
      });
  } else if (typeof promise == 'function') { // Synchronous function
    expect(
      () => promise()
    ).to.throw(errorType, message);
  }
}

function setupRecording() {
  nock.restore(); // Clear nock
  nock.recorder.clear(); // Clear recorder
  nock.recorder.rec({
    dont_print: true, // No stdout output
    output_objects: true // Returns objects instead of a string about recording
  });
}

function stopRecording() {
  nock.restore();
}

function saveFiles() {
  const indentationSpaces = 2;
  nock.recorder.play().forEach(function(record) {
    // Exclude getting OTP code from email requests
    if (record.scope == 'http://localhost:1080') {
      return;
    }
    const filePath = filenameFromRequest(record.method, record.path);
    const json = JSON.stringify(record.response, null, indentationSpaces);
    try {
      fs.writeFileSync(filePath, json);
      console.debug(`Response written to ${filePath}`);
    } catch(error) {
      console.error(error);
    }
  });
}

function filenameFromRequest(httpMethod, url) {
  const extension = 'json';
  const targetDir = __dirname + '/replies/otp_flow/';

  const urlPathForFilename = url
    .replace(/^\//g, '') // Remove leading slash
    .replace(/=/g, "-") // Convert all '=' to '-', for example, 'foo?bar=1' becomes 'foo?bar-1'
    .replace(/[^\w-]+/g, "_") // Leave alphanumeric characters and dashes as is, convert everything else to underscores
    .toLowerCase() // Preventing filename case sensitivity issues before they become a pain

  const httpMethodForFilename = httpMethod.toLowerCase(); // Preventing filename case sensitivity issues
  const filename = `${httpMethodForFilename}_${urlPathForFilename}.${extension}`
  const absolutePath = targetDir + filename;

  return absolutePath;
}

function cleanup() {
  nock.recorder.clear();
  console.debug("Finished recording responses");
}
