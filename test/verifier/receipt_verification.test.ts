import { AVVerifier } from '../../lib/av_verifier';
import { expect } from 'chai';
import sinon = require('sinon');
import { bulletinBoardHost } from '../test_helpers'
import { LatestConfig } from '../../lib/av_client/types';
import latestConfig from '../fixtures/latestConfig';
import {InvalidReceiptError, InvalidTrackingCodeError} from "../../lib/av_client/errors";
import * as AVCrypto from "@assemblyvoting/av-crypto";


describe('#isReceiptValid', () => {
  let verifier: AVVerifier;
  const config: LatestConfig = latestConfig;

  beforeEach(async () => {
    verifier = new AVVerifier(bulletinBoardHost + 'us');
    await verifier.initialize(config)
  });

  context('given valid receipt', () => {
    const receipt =
        "eyJhZGRyZXNzIjoiMDFkOTc2OTZjNTlmYWFmMWFiYjhmNDJhZDY2MTMxZGUwNThkZWE4MTU1N2NiNTI2N2E0ZjcwOTlkMjNhNjEzZiIsInBh\n" +
        "cmVudEFkZHJlc3MiOiI5MmVmOTU0MzcyNmEyZDhlMjFiMGVlOGE0ZDQwMDdlZGE1MzkzYzMyMDA2ZjU4ZWFhMTJkZTczNzQ2MjQ3NWU0Iiwi\n" +
        "cHJldmlvdXNBZGRyZXNzIjoiOTJlZjk1NDM3MjZhMmQ4ZTIxYjBlZThhNGQ0MDA3ZWRhNTM5M2MzMjAwNmY1OGVhYTEyZGU3Mzc0NjI0NzVl\n" +
        "NCIsInJlZ2lzdGVyZWRBdCI6IjIwMjQtMDctMzBUMTE6NDY6MzUuMDc3WiIsImRiYlNpZ25hdHVyZSI6IjYwNzMzNTI4MTYzZTM5ZDk2ZDJl\n" +
        "YTUxNWNjZjZlMjA2MTdiZjllOWQyNTcyZmYzZjRlMjU0ODQ2ZjczZjRlNTYsMDk4ZDcxYTdlYTAzYjY2NDUwYTk0ZDIzMWQzNTViNjZmMTNh\n" +
        "YzI4NDZhMzhjODk4ZGEzNjRjOGI3MDJhY2YwNyIsInZvdGVyU2lnbmF0dXJlIjoiMWFhYWZiZWNhMjdiYWE1ZWQ4ZDUxMDg2OWIyNzg3ZDk3\n" +
        "NWQ4M2M4MjRhYzZmMGRhYWZhMzA2YjVlZDMzZGY3YSwyZDUzN2Q5ZWUzZGE0YWM4YjU1MjM3N2U1YTk2MmY0OGNmNmVmZTNmN2M1MzVkNTc5\n" +
        "MDc2Mjg5NGRkYmNlODk2In0="
    const trackingCode = "1D6vybS"

    before(() => {
      config.items.genesisConfig.content.publicKey = "029abf158b2438e561afe4bc5b85629d46610a526c8a6284f24076c4e4b03264aa"
    })

    it('succeeds', async () => {
      expect(() => verifier.validateReceipt(receipt, trackingCode)).not.to.throw
    });

    context('given a different signing key', () => {
      before(() => {
        config.items.genesisConfig.content.publicKey = "0220f81d43002c88229ed8c80cfc7f84f9700ee13d80e1be1cd8a3677f84e99ae1"
      })

      it('throws validation error', async () => {
        expect(() => verifier.validateReceipt(receipt, trackingCode)).to.throw(InvalidReceiptError, 'Board receipt verification failed')
      });
    });

    context('given a mismatching tracking code', () => {
      const trackingCode = "1nvaLid"

      it('throws validation error', async () => {
        expect(() => verifier.validateReceipt(receipt, trackingCode)).to.throw(InvalidTrackingCodeError, 'Tracking code does not match the receipt')
      });
    });
  });

  context('given invalid receipt', () => {
    const receipt = "invalid"
    const trackingCode = "1D6vybS"

    it('returns throws error', async () => {
      expect(() => verifier.validateReceipt(receipt, trackingCode)).to.throw(InvalidReceiptError, "Receipt string is invalid");
    });

    context('given an item with broken address', () => {
      // The registered_at attribute is changed
      const receipt =
        "eyJhZGRyZXNzIjoiMDFkOTc2OTZjNTlmYWFmMWFiYjhmNDJhZDY2MTMxZGUwNThkZWE4MTU1N2NiNTI2N2E0ZjcwOTlkMjNhNjEzZiIsInBh\n" +
        "cmVudEFkZHJlc3MiOiI5MmVmOTU0MzcyNmEyZDhlMjFiMGVlOGE0ZDQwMDdlZGE1MzkzYzMyMDA2ZjU4ZWFhMTJkZTczNzQ2MjQ3NWU0Iiwi\n" +
        "cHJldmlvdXNBZGRyZXNzIjoiOTJlZjk1NDM3MjZhMmQ4ZTIxYjBlZThhNGQ0MDA3ZWRhNTM5M2MzMjAwNmY1OGVhYTEyZGU3Mzc0NjI0NzVl\n" +
        "NCIsInJlZ2lzdGVyZWRBdCI6IjIwMjMtMDctMzBUMTE6NDY6MzUuMDc3WiIsImRiYlNpZ25hdHVyZSI6IjYwNzMzNTI4MTYzZTM5ZDk2ZDJl\n" +
        "YTUxNWNjZjZlMjA2MTdiZjllOWQyNTcyZmYzZjRlMjU0ODQ2ZjczZjRlNTYsMDk4ZDcxYTdlYTAzYjY2NDUwYTk0ZDIzMWQzNTViNjZmMTNh\n" +
        "YzI4NDZhMzhjODk4ZGEzNjRjOGI3MDJhY2YwNyIsInZvdGVyU2lnbmF0dXJlIjoiMWFhYWZiZWNhMjdiYWE1ZWQ4ZDUxMDg2OWIyNzg3ZDk3\n" +
        "NWQ4M2M4MjRhYzZmMGRhYWZhMzA2YjVlZDMzZGY3YSwyZDUzN2Q5ZWUzZGE0YWM4YjU1MjM3N2U1YTk2MmY0OGNmNmVmZTNmN2M1MzVkNTc5\n" +
        "MDc2Mjg5NGRkYmNlODk2In0="

      it('returns false', async () => {
        expect(() => verifier.validateReceipt(receipt, trackingCode)).to.throw(InvalidReceiptError, 'BoardItem address does not match expected address')
      });
    });
  });

  context('when a generic error is thrown', () => {
    const receipt =
      "eyJhZGRyZXNzIjoiMDFkOTc2OTZjNTlmYWFmMWFiYjhmNDJhZDY2MTMxZGUwNThkZWE4MTU1N2NiNTI2N2E0ZjcwOTlkMjNhNjEzZiIsInBh\n" +
      "cmVudEFkZHJlc3MiOiI5MmVmOTU0MzcyNmEyZDhlMjFiMGVlOGE0ZDQwMDdlZGE1MzkzYzMyMDA2ZjU4ZWFhMTJkZTczNzQ2MjQ3NWU0Iiwi\n" +
      "cHJldmlvdXNBZGRyZXNzIjoiOTJlZjk1NDM3MjZhMmQ4ZTIxYjBlZThhNGQ0MDA3ZWRhNTM5M2MzMjAwNmY1OGVhYTEyZGU3Mzc0NjI0NzVl\n" +
      "NCIsInJlZ2lzdGVyZWRBdCI6IjIwMjQtMDctMzBUMTE6NDY6MzUuMDc3WiIsImRiYlNpZ25hdHVyZSI6IjYwNzMzNTI4MTYzZTM5ZDk2ZDJl\n" +
      "YTUxNWNjZjZlMjA2MTdiZjllOWQyNTcyZmYzZjRlMjU0ODQ2ZjczZjRlNTYsMDk4ZDcxYTdlYTAzYjY2NDUwYTk0ZDIzMWQzNTViNjZmMTNh\n" +
      "YzI4NDZhMzhjODk4ZGEzNjRjOGI3MDJhY2YwNyIsInZvdGVyU2lnbmF0dXJlIjoiMWFhYWZiZWNhMjdiYWE1ZWQ4ZDUxMDg2OWIyNzg3ZDk3\n" +
      "NWQ4M2M4MjRhYzZmMGRhYWZhMzA2YjVlZDMzZGY3YSwyZDUzN2Q5ZWUzZGE0YWM4YjU1MjM3N2U1YTk2MmY0OGNmNmVmZTNmN2M1MzVkNTc5\n" +
      "MDc2Mjg5NGRkYmNlODk2In0="
    const trackingCode = "1D6vybS"

    before(() => {
      sinon.replace(AVCrypto, 'hexDigest', sinon.fake.throws(new SyntaxError('Error')));
    })

    it('bubbles up', () => {
      expect(() => verifier.validateReceipt(receipt, trackingCode)).to.throw(SyntaxError, "Error");
    })
  })
});
