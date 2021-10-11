import { expect } from 'chai';
import nock = require('nock');

import { OTPProvider } from '../lib/av_client/connectors/otp_provider';
import { OTPProviderHost } from './test_helpers';
import {
  AccessCodeInvalid,
  NetworkError,
  UnsupportedServerReplyError
} from '../lib/av_client/errors';

describe('OTPProvider#requestOTPAuthorization', () => {
  let provider: OTPProvider;
  const correctOTP = '1234';
  const correctEmail = 'us-voter-123@aion.dk';
  const incorrectOTP = '0000';

  beforeEach(() => {
    provider = new OTPProvider(OTPProviderHost);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  context('wrong OTP', () => {
    it('returns an error message', async () => {
      nock(OTPProviderHost).post('/authorize')
        .reply(403, { errorCode: 'OTP_DOES_NOT_MATCH' });

      return provider.requestOTPAuthorization(incorrectOTP, correctEmail).then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => {
          expect(error).to.be.an.instanceof(AccessCodeInvalid)
          expect(error.message).to.equal('OTP code invalid')
        }
      )
    });
  });

  context('OTP Provider returns an unsupported error message', () => {
    it('returns an error message', async () => {
      nock(OTPProviderHost).post('/authorize')
        .reply(403, { garbage: 'nonsense' });

      return provider.requestOTPAuthorization(correctOTP, correctEmail).then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => {
          expect(error).to.be.an.instanceof(UnsupportedServerReplyError);
          expect(error.message).to.equal('Unsupported OTP Provider error message: {"garbage":"nonsense"}')
        }
      );
    });
  });

  context('OTP Provider returns an unsupported error code', () => {
    it('returns an error message', async () => {
      nock(OTPProviderHost).post('/authorize')
        .reply(403, { errorCode: 'UNKNOWN_ERROR_CODE', errorMessage: 'Not supported yet' });

      return provider.requestOTPAuthorization(correctOTP, correctEmail).then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => {
          expect(error).to.be.an.instanceof(UnsupportedServerReplyError);
          expect(error.message).to.equal('Unsupported OTP Provider error message: Not supported yet')
        }
      );
    });
  });

  context('OTP Provider routing changed', () => {
    it('returns an error message', async () => {
      nock(OTPProviderHost).post('/authorize')
        .reply(404);

      return provider.requestOTPAuthorization(correctOTP, correctEmail).then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => {
          expect(error.message).to.equal('Request failed with status code 404');
        }
      );
    });
  });

  context('OTP Provider connection timeout', () => {
    it('returns network error', async () => {
      nock(OTPProviderHost).post('/authorize')
        .replyWithError({code: 'ETIMEDOUT'});

      return provider.requestOTPAuthorization(correctOTP, correctEmail).then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => {
          expect(error).to.be.an.instanceof(NetworkError);
          expect(error.message).to.equal('Network error. Could not connect to OTP Provider.')
        }
      );
    });
  });

  context('OTP Provider host unavailable', () => {
    it('returns network error', async () => {
      const unreachableHost = 'http://sdguet432t4tjsdjf.does-not-exist';
      provider = new OTPProvider(unreachableHost);

      return provider.requestOTPAuthorization(correctOTP, correctEmail).then(
        () => expect.fail('Expected promise to be rejected'),
        (error) => {
          expect(error).to.be.an.instanceof(NetworkError);
          expect(error.message).to.equal('Network error. Could not connect to OTP Provider.')
        }
      );
    })
  });
});
