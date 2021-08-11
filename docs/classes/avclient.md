[@aion-dk/js-client](../README.md) / [Exports](../modules.md) / AVClient

# Class: AVClient

# Assembly Voting Client API.

The API is responsible for handling all the cryptographic operations and all network communication with:
* the Digital Ballot Box
* the Voter Authorization Coordinator service
* the OTP provider(s)

### Expected sequence of methods being executed

|Method                                                                    | Description |
-------------------------------------------------------------------------- | ---
|[requestAccessCode](avclient.md#requestaccesscode)                   | Initiates the authorization process, in case voter has not authorized yet. Requests access code to be sent to voter email |
|[validateAccessCode](avclient.md#validateaccesscode)                 | Gets voter authorized to vote. |
|[constructBallotCryptograms](avclient.md#constructballotcryptograms) | Constructs voter ballot cryptograms. |
|[spoilBallotCryptograms](avclient.md#spoilballotcryptograms)         | Optional. Initiates process of testing the ballot encryption. |
|[submitBallotCryptograms](avclient.md#submitballotcryptograms)       | Finalizes the voting process. |
|[purgeData](avclient.md#purgedata)                                   | Optional. Explicitly purges internal data. |

## Table of contents

### Constructors

- [constructor](avclient.md#constructor)

### Methods

- [requestAccessCode](avclient.md#requestaccesscode)
- [validateAccessCode](avclient.md#validateaccesscode)
- [constructBallotCryptograms](avclient.md#constructballotcryptograms)
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

▸ **requestAccessCode**(`personalIdentificationInformation`): `Promise`<`string`\>

Should be called when a voter chooses digital vote submission (instead of mail-in).

Will attempt to get backend services to send an access code (one time password, OTP) to voter's email address.

Should be followed by [validateAccessCode](avclient.md#validateaccesscode) to submit access code for validation.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `personalIdentificationInformation` | `string` | TODO: needs better specification. |

#### Returns

`Promise`<`string`\>

If voter has not yet authorized with an access code, it will return `'Unauthorized'`.<br>
If voter has already authorized, then returns `'Authorized'`.

___

### validateAccessCode

▸ **validateAccessCode**(`code`): `Promise`<`string`\>

Should be called after [requestAccessCode](avclient.md#requestaccesscode).

Takes an access code (OTP) that voter received, uses it to authorize to submit votes.

Internally, generates a private/public key pair, then attempts to authorize the public
key with each OTP provider.

Should be followed by [constructBallotCryptograms](avclient.md#constructballotcryptograms).

#### Parameters

| Name | Type |
| :------ | :------ |
| `code` | `string` \| `string`[] |

#### Returns

`Promise`<`string`\>

Returns `'Success'` if authorization succeeded.

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

### spoilBallotCryptograms

▸ **spoilBallotCryptograms**(): `Promise`<[`ContestIndexed`](../interfaces/contestindexed.md)<`string`\>\>

Should be called when voter chooses to test the encryption of their ballot.

TODO: exact process needs specification.

#### Returns

`Promise`<[`ContestIndexed`](../interfaces/contestindexed.md)<`string`\>\>

Returns an index, where keys are contest ids, and values are randomizers, that the digital ballot box generates. Example:
```javascript
{
  '1': '12131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f3031',
  '2': '1415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f30313233'
}
```

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
