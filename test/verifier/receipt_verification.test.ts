import { AVVerifier } from '../../lib/av_verifier';
import { expect } from 'chai';
import { bulletinBoardHost } from '../test_helpers'
import { LatestConfig } from '../../lib/av_client/types';
import latestConfig from '../fixtures/latestConfig';
import {InvalidReceiptError, InvalidTrackingCodeError} from "../../lib/av_client/errors";


describe('#isReceiptValid', () => {
  let verifier: AVVerifier;
  const config: LatestConfig = latestConfig;

  beforeEach(async () => {
    verifier = new AVVerifier(bulletinBoardHost + 'us');
    await verifier.initialize(config)
  });

  context('given valid receipt', () => {
    const receipt =
        "eyJhZGRyZXNzIjoiMmU0YTNmMTU2OGE5NWQwMjA3YWUwY2QyM2MwYTU1NDJhOGQ3NWU0Y2EyMmI2YWFlNDJmNzNmOGFkNWJmYWFmZSIsInBh\n" +
        "cmVudEFkZHJlc3MiOiIxMTRlOTJhMTU5OGQ3YzM2MDVmYTgxYmY1ZTQzYjM2NWMxNmZhN2QwMTI5NWVjYWM5YmYzZmFjMWMyYWI0YjIwIiwi\n" +
        "cHJldmlvdXNBZGRyZXNzIjoiMTE0ZTkyYTE1OThkN2MzNjA1ZmE4MWJmNWU0M2IzNjVjMTZmYTdkMDEyOTVlY2FjOWJmM2ZhYzFjMmFiNGIy\n" +
        "MCIsInJlZ2lzdGVyZWRBdCI6IjIwMjQtMDctMjlUMDc6MTg6MzYuMjAyWiIsImRiYlNpZ25hdHVyZSI6ImFjMDlhYTMwMTI2ZDE2YzczZDIw\n" +
        "Y2I5MmQ3ZDU4YzgwYzExM2YyZmRhYjliMjI4NTkyZDQyMmEyY2Y1M2E0OTMsOTBhMWM0N2U4MTc2NjIxODQ2NGU1ZjIzODdhYjViNDE5MGYy\n" +
        "MzdjMjMwN2ZhODAyYzk3ODQ2ZmE3ZmJkY2RmMiIsInZvdGVyU2lnbmF0dXJlIjoiM2JjYTVmNGRlZTNjZjJhYmJjZDY3NjYzYTU4ZjBmYjc0\n" +
        "NTk0MDRjOWNmYThlNmNkZjg5ZWQzZGZiZTgxM2UyZiwwOWYzZGFlYzEzMDJlNzEwOTYzNWEyZmUzNTlhODU4MTJjNWI5Y2EyYjEyNzYzMmUw\n" +
        "NDRjNTdkZTcwNDYwODZmIn0="
    const trackingCode = "6DuXTPM"

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

      it('throw validation error', async () => {
        expect(() => verifier.validateReceipt(receipt, trackingCode)).to.throw(InvalidReceiptError, 'Board receipt verification failed')
      });
    });

    context('given a mismatching tracking code', () => {
      const trackingCode = "1nvaLid"

      it('throw validation error', async () => {
        expect(() => verifier.validateReceipt(receipt, trackingCode)).to.throw(InvalidTrackingCodeError, 'Tracking code does not match the receipt')
      });
    });
  });

  context('given invalid receipt', () => {
    const receipt = "invalid"
    const trackingCode = "6DuXTPM"

    it('returns throws error', async () => {
      expect(() => verifier.validateReceipt(receipt, trackingCode)).to.throw(InvalidReceiptError, "Receipt string is invalid");
    });

    context('given an item with broken address', () => {
      // The registered_at attribute is changed
      const receipt =
          "eyJhZGRyZXNzIjoiMmU0YTNmMTU2OGE5NWQwMjA3YWUwY2QyM2MwYTU1NDJhOGQ3NWU0Y2EyMmI2YWFlNDJmNzNmOGFkNWJmYWFmZSIsInBh\n" +
          "cmVudEFkZHJlc3MiOiIxMTRlOTJhMTU5OGQ3YzM2MDVmYTgxYmY1ZTQzYjM2NWMxNmZhN2QwMTI5NWVjYWM5YmYzZmFjMWMyYWI0YjIwIiwi\n" +
          "cHJldmlvdXNBZGRyZXNzIjoiMTE0ZTkyYTE1OThkN2MzNjA1ZmE4MWJmNWU0M2IzNjVjMTZmYTdkMDEyOTVlY2FjOWJmM2ZhYzFjMmFiNGIy\n" +
          "MCIsInJlZ2lzdGVyZWRBdCI6IjIwMjMtMDctMjlUMDc6MTg6MzYuMjAyWiIsImRiYlNpZ25hdHVyZSI6ImFjMDlhYTMwMTI2ZDE2YzczZDIw\n" +
          "Y2I5MmQ3ZDU4YzgwYzExM2YyZmRhYjliMjI4NTkyZDQyMmEyY2Y1M2E0OTMsOTBhMWM0N2U4MTc2NjIxODQ2NGU1ZjIzODdhYjViNDE5MGYy\n" +
          "MzdjMjMwN2ZhODAyYzk3ODQ2ZmE3ZmJkY2RmMiIsInZvdGVyU2lnbmF0dXJlIjoiM2JjYTVmNGRlZTNjZjJhYmJjZDY3NjYzYTU4ZjBmYjc0\n" +
          "NTk0MDRjOWNmYThlNmNkZjg5ZWQzZGZiZTgxM2UyZiwwOWYzZGFlYzEzMDJlNzEwOTYzNWEyZmUzNTlhODU4MTJjNWI5Y2EyYjEyNzYzMmUw\n" +
          "NDRjNTdkZTcwNDYwODZmIn0="

      it('returns false', async () => {
        expect(() => verifier.validateReceipt(receipt, trackingCode)).to.throw(InvalidReceiptError, 'BoardItem address does not match expected address')
      });
    });
  });
});
