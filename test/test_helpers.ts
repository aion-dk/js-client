/*eslint-disable @typescript-eslint/no-explicit-any*/
import { expect } from 'chai';
import sinon = require('sinon');
import * as sjcl from '../lib/av_client/sjcl';
import 'dotenv/config'

function getEnvVar(name: string): string {
  const variable = process.env[name]
  if( variable ) return variable
  throw new Error(`Missing expected environment variable ${name}`)
}

export const bulletinBoardHost = getEnvVar('DBB_URL')
export const conferenceHost = getEnvVar('CONFERENCE_HOST_URL')
export const voterAuthorizerHost = getEnvVar('VOTER_AUTHORIZER_URL')
export const OTPProviderHost = getEnvVar('OTP_PROVIDER_URL')
export const mailcatcherHost = getEnvVar('MAILCATCHER_URL')
export const OTPProviderElectionContextId = 'cca2b217-cedd-4d58-a103-d101ba472eb8';

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
  const output : number[] = []
  for (let i = 0; i < nwords; i++) {
    if (nextRandomInt > highestValidNumber) {
      nextRandomInt = lowestValidNumber
    }
    output.push(nextRandomInt++)
  }
  global.deterministicOffset++;

  return output
}

export function resetDeterministicOffset() {
  global.deterministicOffset = 0;
}

// Make Math.random deterministic when running tests
export function deterministicMathRandom() {
  return 0.42
}

type SynchronousFunction = () => void

export async function expectError(promise: (Promise<unknown>|SynchronousFunction), errorType: any, message: string): Promise<unknown> {
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