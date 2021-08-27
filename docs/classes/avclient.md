[@aion-dk/js-client](../README.md) / [Exports](../modules.md) / AVClient

# Class: AVClient

# Assembly Voting Client API.

The API is responsible for handling all the cryptographic operations and all network communication with:
* the Digital Ballot Box
* the Voter Authorization Coordinator service
* the OTP provider(s)

## Expected sequence of methods being executed

|Method                                                                    | Description |
-------------------------------------------------------------------------- | ---
|[requestAccessCode](avclient.md#requestaccesscode)                   | Initiates the authorization process, in case voter has not authorized yet. Requests access code to be sent to voter email |
|[validateAccessCode](avclient.md#validateaccesscode)                 | Gets voter authorized to vote. |
|[constructBallotCryptograms](avclient.md#constructballotcryptograms) | Constructs voter ballot cryptograms. |
|[spoilBallotCryptograms](avclient.md#spoilballotcryptograms)         | Optional. Initiates process of testing the ballot encryption. |
|[submitBallotCryptograms](avclient.md#submitballotcryptograms)       | Finalizes the voting process. |
|[purgeData](avclient.md#purgedata)                                   | Optional. Explicitly purges internal data. |

## Example walkthrough test

```typescript
import { AVClient } from '../lib/av_client';
import { expect } from 'chai';
import { readmeTestSetup, readmeTestTeardown } from './readme_example_helper';

describe('entire voter flow using OTP authorization', () => {
  beforeEach(() => readmeTestSetup());
  afterEach(() => readmeTestTeardown());

  it('returns a receipt', async () => {
    const client = new AVClient('http://localhost:3000/test/app');

    const requestAccessCodeResult = await client.requestAccessCode('some PII info');
    expect(requestAccessCodeResult).to.eq('OK')

    const validateAccessCodeResult = await client.validateAccessCode('1234', 'voter@foo.bar');
    expect(validateAccessCodeResult).to.eq('OK');

    const cvr = { '1': 'option1', '2': 'optiona' };
    const fingerprint = await client.constructBallotCryptograms(cvr);
    expect(fingerprint).to.eq('da46ec752fd9197c0d77e6d843924b082b8b23350e8ac5fd454051dc1bf85ad2');

    const affidavit = 'some bytes, most likely as binary PDF';
    const receipt = await client.submitBallotCryptograms(affidavit);
    expect(receipt).to.eql({
      previousBoardHash: 'd8d9742271592d1b212bbd4cbbbe357aef8e00cdbdf312df95e9cf9a1a921465',
      boardHash: '87abbdea83326ba124a99f8f56ba4748f9df97022a869c297aad94c460804c03',
      registeredAt: '2020-03-01T10:00:00.000+01:00',
      serverSignature: 'bfaffbaf8778abce29ea98ebc90ca91e091881480e18ef31da815d181cead1f6,8977ad08d4fc3b1d9be311d93cf8e98178142685c5fbbf703abf2188a8d1c862',
      voteSubmissionId: 6
    });
  });
});

```

## Table of contents

### Constructors

- [constructor](avclient.md#constructor)

### Methods

- [requestAccessCode](avclient.md#requestaccesscode)
- [validateAccessCode](avclient.md#validateaccesscode)
- [submitAccessCode](avclient.md#submitaccesscode)
- [constructBallotCryptograms](avclient.md#constructballotcryptograms)
- [generateTestCode](avclient.md#generatetestcode)
- [spoilBallotCryptograms](avclient.md#spoilballotcryptograms)
- [submitBallotCryptograms](avclient.md#submitballotcryptograms)
- [purgeData](avclient.md#purgedata)

## Constructors

### constructor

• **new AVClient**(`bulletinBoardURL`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bulletinBoardURL` | `string` | URL to the Assembly Voting backend server, specific for election. |

## Methods

### requestAccessCode

▸ **requestAccessCode**(`opaqueVoterId`): `Promise`<`string`\>

Should be called when a voter chooses digital vote submission (instead of mail-in).

Will attempt to get backend services to send an access code (one time password, OTP) to voter's email address.

Should be followed by [validateAccessCode](avclient.md#validateaccesscode) to submit access code for validation.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opaqueVoterId` | `string` | Voter ID that preserves voter anonymity. |

#### Returns

`Promise`<`string`\>

'OK' or an error.

___

### validateAccessCode

▸ **validateAccessCode**(`code`, `email`): `Promise`<`string`\>

Should be called after [requestAccessCode](avclient.md#requestaccesscode).

Takes an access code (OTP) that voter received, uses it to authorize to submit votes.

Internally, generates a private/public key pair, then attempts to authorize the public
key with each OTP provider.

Should be followed by [constructBallotCryptograms](avclient.md#constructballotcryptograms).

**`throws`** AccessCodeExpired if an OTP code has expired

**`throws`** AccessCodeInvalid if an OTP code is invalid

**`throws`** NetworkError if any request failed to get a response

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `code` | `string` \| `string`[] | An access code string. |
| `email` | `string` | Voter email. |

#### Returns

`Promise`<`string`\>

Returns `'OK'` if authorization succeeded.

___

### submitAccessCode

▸ **submitAccessCode**(`code`, `email`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `code` | `string` \| `string`[] |
| `email` | `string` |

#### Returns

`Promise`<`string`\>

___

### constructBallotCryptograms

▸ **constructBallotCryptograms**(`cvr`): `Promise`<`string`\>

Should be called after [validateAccessCode](avclient.md#validateaccesscode).

Encrypts a cast-vote-record (CVR) and generates vote cryptograms.

Example:
```javascript
const client = new AVClient(url);
const cvr = { '1': 'option1', '2': 'optiona' };
const fingerprint = await client.constructBallotCryptograms(cvr);
```

Where `'1'` and `'2'` are contest ids, and `'option1'` and `'optiona'` are
values internal to the AV election config.

Should be followed by either [spoilBallotCryptograms](avclient.md#spoilballotcryptograms)
or [submitBallotCryptograms](avclient.md#submitballotcryptograms).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cvr` | [`CastVoteRecord`](../modules.md#castvoterecord) | Object containing the selections for each contest.<br>TODO: needs better specification. |

#### Returns

`Promise`<`string`\>

Returns fingerprint of the cryptograms. Example:
```javascript
'5e4d8fe41fa3819cc064e2ace0eda8a847fe322594a6fd5a9a51c699e63804b7'
```

___

### generateTestCode

▸ **generateTestCode**(): `string`

Should be called after [validateAccessCode](avclient.md#validateaccesscode).
Should be called before [spoilBallotCryptograms](avclient.md#spoilballotcryptograms).

Generates an encryption key that is used to add another encryption layer to vote cryptograms when they are spoiled.

The generateTestCode is used in case [spoilBallotCryptograms](avclient.md#spoilballotcryptograms) is called afterwards.

#### Returns

`string`

Returns the test code. Example:
```javascript
'5e4d8fe41fa3819cc064e2ace0eda8a847fe322594a6fd5a9a51c699e63804b7'
```

___

### spoilBallotCryptograms

▸ **spoilBallotCryptograms**(): `Promise`<`string`\>

Should be called when voter chooses to test the encryption of their ballot.
Gets commitment opening of the digital ballot box and validates it.

#### Returns

`Promise`<`string`\>

Returns 'Success' if the validation succeeds.

___

### submitBallotCryptograms

▸ **submitBallotCryptograms**(`affidavit`): `Promise`<[`Receipt`](../modules.md#receipt)\>

Should be the last call in the entire voting process.

Submits encrypted ballot and the affidavit to the digital ballot box.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `affidavit` | `string` | The affidavit document.<br>TODO: clarification of the affidavit format is still needed. |

#### Returns

`Promise`<[`Receipt`](../modules.md#receipt)\>

Returns the vote receipt. Example of a receipt:
```javascript
{
   previousBoardHash: 'd8d9742271592d1b212bbd4cbbbe357aef8e00cdbdf312df95e9cf9a1a921465',
   boardHash: '5a9175c2b3617298d78be7d0244a68f34bc8b2a37061bb4d3fdf97edc1424098',
   registeredAt: '2020-03-01T10:00:00.000+01:00',
   serverSignature: 'dbcce518142b8740a5c911f727f3c02829211a8ddfccabeb89297877e4198bc1,46826ddfccaac9ca105e39c8a2d015098479624c411b4783ca1a3600daf4e8fa',
   voteSubmissionId: 6
}
```

___

### purgeData

▸ **purgeData**(): `void`

Purges internal data.

#### Returns

`void`
