import { expect } from "chai";

import { electionCodeToPrivateKey } from "../../lib/av_client/aion_crypto.js"

describe("#electionCodeToPrivateKey", () => {

  it("deterministically converts election codes to private keys", () => {
    const electionCodes = ['s3cr3t5', 'hidden', '1', 'sellus', 's3cr3t5'];

    const privateKeys = electionCodes.map(electionCode => electionCodeToPrivateKey(electionCode));

    expect(privateKeys).to.eql([
      '631a1838f1e82b7b39f2b620a790de69ca8feb0cfd4ba984350a5fe3a2fda299',
      '502b2a265be9cb1d3b25028904ca63687b5384bf862ad1c5ae8929f31e2afd39',
      'a259f4b44e30abc0cd53379381bdc86f44723911a5bc03bf4ff21d1b49b53efd',
      '1c4e46d624d7de41249bd8d3e5538f3464d43c23e22251468a356c29926b1c24',
      '631a1838f1e82b7b39f2b620a790de69ca8feb0cfd4ba984350a5fe3a2fda299',
    ]);
  });

  it('generates a hex string representing 32 bytes (64 nibbles)', () => {
    const privateKey = electionCodeToPrivateKey('test');

    expect(privateKey.length).to.eql(64);
  })

  context('when creating keys for a different curve size', () => {
    it('generates a hex string representing 16 bytes (32 nibbles)', () => {
      const privateKey = electionCodeToPrivateKey('test', 128);

      expect(privateKey.length).to.eql(32);
    })
  })
})

