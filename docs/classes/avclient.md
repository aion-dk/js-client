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
|[initialize](AVClient.md#initialize)                                 | Initializes the library by fetching election configuration |
|[requestAccessCode](AVClient.md#requestaccesscode)                   | Initiates the authorization process, in case voter has not authorized yet. Requests access code to be sent to voter email |
|[validateAccessCode](AVClient.md#validateaccesscode)                 | Gets voter authorized to vote. |
|[registerVoter](AVClient.md#registervoter)                           | Registers the voter on the bulletin board |
|[constructBallotCryptograms](AVClient.md#constructballotcryptograms) | Constructs voter ballot cryptograms. |
|[spoilBallotCryptograms](AVClient.md#spoilballotcryptograms)         | Optional. Initiates process of testing the ballot encryption. |
|[submitBallotCryptograms](AVClient.md#submitballotcryptograms)       | Finalizes the voting process. |
|[purgeData](AVClient.md#purgedata)                                   | Optional. Explicitly purges internal data. |

## Example walkthrough test

```typescript
[[include:readme_example.test.ts]]
```

## Table of contents

### Constructors

- [constructor](AVClient.md#constructor)

### Methods

- [initialize](AVClient.md#initialize)
- [requestAccessCode](AVClient.md#requestaccesscode)
- [validateAccessCode](AVClient.md#validateaccesscode)
- [registerVoter](AVClient.md#registervoter)
- [constructBallotCryptograms](AVClient.md#constructballotcryptograms)
- [generateTestCode](AVClient.md#generatetestcode)
- [spoilBallotCryptograms](AVClient.md#spoilballotcryptograms)
- [submitBallotCryptograms](AVClient.md#submitballotcryptograms)
- [purgeData](AVClient.md#purgedata)
- [getElectionConfig](AVClient.md#getelectionconfig)

## Constructors

### constructor

• **new AVClient**(`bulletinBoardURL`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bulletinBoardURL` | `string` | URL to the Assembly Voting backend server, specific for election. |

## Methods

### initialize

▸ **initialize**(`electionConfig`): `Promise`<`void`\>

Initializes the client with an election config.
If no config is provided, it fetches one from the backend.

**`throws`** NetworkError if any request failed to get a response

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `electionConfig` | `ElectionConfig` | Allows injection of an election configuration for testing purposes |

#### Returns

`Promise`<`void`\>

Returns undefined if succeeded or throws an error

▸ **initialize**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

___

### requestAccessCode

▸ **requestAccessCode**(`opaqueVoterId`, `email`): `Promise`<`void`\>

Should be called when a voter chooses digital vote submission (instead of mail-in).

Will attempt to get backend services to send an access code (one time password, OTP) to voter's email address.

Should be followed by [validateAccessCode](AVClient.md#validateaccesscode) to submit access code for validation.

**`throws`** VoterRecordNotFound if no voter was found

**`throws`** NetworkError if any request failed to get a response

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opaqueVoterId` | `string` | Voter ID that preserves voter anonymity. |
| `email` | `string` | where the voter expects to receive otp code. |

#### Returns

`Promise`<`void`\>

Returns undefined or throws an error.

___

### validateAccessCode

▸ **validateAccessCode**(`code`): `Promise`<`void`\>

Should be called after [requestAccessCode](AVClient.md#requestaccesscode).

Takes an access code (OTP) that voter received, uses it to authorize to submit votes.

Internally, generates a private/public key pair, then attempts to authorize the public
key with each OTP provider.

Should be followed by [constructBallotCryptograms](AVClient.md#constructballotcryptograms).

**`throws`** InvalidStateError if called before required data is available

**`throws`** AccessCodeExpired if an OTP code has expired

**`throws`** AccessCodeInvalid if an OTP code is invalid

**`throws`** NetworkError if any request failed to get a response

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `code` | `string` | An access code string. |

#### Returns

`Promise`<`void`\>

Returns undefined if authorization succeeded or throws an error

___

### registerVoter

▸ **registerVoter**(): `Promise`<`void`\>

Registers a voter

#### Returns

`Promise`<`void`\>

undefined or throws an error

___

### constructBallotCryptograms

▸ **constructBallotCryptograms**(`cvr`): `Promise`<`string`\>

Should be called after [validateAccessCode](AVClient.md#validateaccesscode).

Encrypts a cast-vote-record (CVR) and generates vote cryptograms.

Example:
```javascript
const client = new AVClient(url);
const cvr = { '1': 'option1', '2': 'optiona' };
const trackingCode = await client.constructBallotCryptograms(cvr);
```

Where `'1'` and `'2'` are contest ids, and `'option1'` and `'optiona'` are
values internal to the AV election config.

Should be followed by either [spoilBallotCryptograms](AVClient.md#spoilballotcryptograms)
or [submitBallotCryptograms](AVClient.md#submitballotcryptograms).

**`throws`** InvalidStateError if called before required data is available

**`throws`** CorruptCVRError if the cast vote record is invalid

**`throws`** NetworkError if any request failed to get a response

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cvr` | `CastVoteRecord` | Object containing the selections for each contest.<br>TODO: needs better specification. |

#### Returns

`Promise`<`string`\>

Returns the ballot tracking code. Example:
```javascript
'5e4d8fe41fa3819cc064e2ace0eda8a847fe322594a6fd5a9a51c699e63804b7'
```

___

### generateTestCode

▸ **generateTestCode**(): `void`

Should be called after [validateAccessCode](AVClient.md#validateaccesscode).
Should be called before [spoilBallotCryptograms](AVClient.md#spoilballotcryptograms).

Generates an encryption key that is used to add another encryption layer to vote cryptograms when they are spoiled.

The generateTestCode is used in case [spoilBallotCryptograms](AVClient.md#spoilballotcryptograms) is called afterwards.

#### Returns

`void`

Returns the test code. Example:
```javascript
'5e4d8fe41fa3819cc064e2ace0eda8a847fe322594a6fd5a9a51c699e63804b7'
```

___

### spoilBallotCryptograms

▸ **spoilBallotCryptograms**(): `Promise`<`void`\>

Should be called when voter chooses to test the encryption of their ballot.
Gets commitment opening of the digital ballot box and validates it.

**`throws`** InvalidStateError if called before required data is available

**`throws`** ServerCommitmentError if the server commitment is invalid

**`throws`** NetworkError if any request failed to get a response

#### Returns

`Promise`<`void`\>

Returns undefined if the validation succeeds or throws an error

___

### submitBallotCryptograms

▸ **submitBallotCryptograms**(`affidavit`): `Promise`<[`Receipt`](../modules.md#receipt)\>

Should be the last call in the entire voting process.

Submits encrypted ballot and the affidavit to the digital ballot box.

**`throws`** NetworkError if any request failed to get a response

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

___

### getElectionConfig

▸ **getElectionConfig**(): `ElectionConfig`

#### Returns

`ElectionConfig`
