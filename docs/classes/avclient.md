[@aion-dk/js-client](../README.md) / [Exports](../modules.md) / AVClient

# Class: AVClient

# Assembly Voting Client API.

The API is responsible for handling all the cryptographic operations and all network communication with:
* the Digital Ballot Box
* the Voter Authorization Coordinator service
* the OTP providers

Expected sequence of methods being executed, when authorization happens successfully through OTPs:
* [getAuthorizationMethod](avclient.md#getauthorizationmethod), that returns the next step needed to get
the voter authorized to vote.
* [ensureAuthorization](avclient.md#ensureauthorization), that initiates the authorization process, in
case voter has not authorized yet.
* [getNumberOfOTPs](avclient.md#getnumberofotps), that returns the number of OTP codes required for
authorization.
* [finalizeAuthorization](avclient.md#finalizeauthorization), that gets the voter authorized to vote.
* [encryptBallot](avclient.md#encryptballot), that encrypts the voter's ballot.
* [startBenalohChallenge](avclient.md#startbenalohchallenge), that initiates the process of testing the
ballot encryption. This is optional.
* [submitEncryptedBallot](avclient.md#submitencryptedballot), that finalizes the voting process.

## Table of contents

### Constructors

- [constructor](avclient.md#constructor)

### Methods

- [authenticateWithCodes](avclient.md#authenticatewithcodes)
- [encryptBallot](avclient.md#encryptballot)
- [ensureAuthorization](avclient.md#ensureauthorization)
- [finalizeAuthorization](avclient.md#finalizeauthorization)
- [getAuthorizationMethod](avclient.md#getauthorizationmethod)
- [getNumberOfOTPs](avclient.md#getnumberofotps)
- [startBenalohChallenge](avclient.md#startbenalohchallenge)
- [submitEncryptedBallot](avclient.md#submitencryptedballot)

## Constructors

### constructor

• **new AVClient**(`bulletinBoardURL`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bulletinBoardURL` | `string` | URL to the Assembly Voting backend server, specific for election. |

## Methods

### authenticateWithCodes

▸ **authenticateWithCodes**(`codes`): `Promise`<`string`\>

Should only be used when election authorization mode is 'election codes'.

Authenticates or rejects voter, based on their submitted election codes.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `codes` | `string`[] | Array of election code strings. |

#### Returns

`Promise`<`string`\>

Returns 'Success' if authentication succeeded.

___

### encryptBallot

▸ **encryptBallot**(`cvr`): `Promise`<`string`\>

Encrypts a cast-vote-record (CVR) and generates vote cryptograms.

Example:
```javascript
const client = new AVClient(url);
const cvr = { '1': 'option1', '2': 'optiona' };
const fingerprint = await client.encryptBallot(cvr);
```

Where `'1'` and `'2'` are contest ids, and `'option1'` and `'optiona'` are
values internal to the AV election config. This needs further refinement 🧐.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cvr` | [`CastVoteRecord`](../modules.md#castvoterecord) | Object containing the selections for each contest. |

#### Returns

`Promise`<`string`\>

Returns fingerprint of the cryptograms.

___

### ensureAuthorization

▸ **ensureAuthorization**(`personalIdentificationInformation`): `Promise`<`string`\>

This should be called when a voter chooses digital vote submission (instead of mail-in).

This will send a pre-configured number of one time passwords (OTPs) to voter's email address,
unless the voter has already successfully finished submitting OTPs.

This should be followed by
* [getNumberOfOTPs](avclient.md#getnumberofotps) to provide the required number of fields for
the voter to submit OTPs.
* [finalizeAuthorization](avclient.md#finalizeauthorization) to authorize with the submitted OTPs.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `personalIdentificationInformation` | `string` | We don't know yet what this will be 😉. |

#### Returns

`Promise`<`string`\>

If voter has not yet authorized with OTPs, it will return 'Unauthorized'.<br>
If voter has already authorized, then returns 'Authorized'.

___

### finalizeAuthorization

▸ **finalizeAuthorization**(`otpCodes`): `Promise`<`string`\>

This should be called after [ensureAuthorization](avclient.md#ensureauthorization).
Takes the OTPs that voter received, uses them to authorize to submit votes.

Internally, generates a private/public key pair, then attempts to authorize the public
key with each OTP provider.

#### Parameters

| Name | Type |
| :------ | :------ |
| `otpCodes` | `string`[] |

#### Returns

`Promise`<`string`\>

Returns 'Success' if authorization succeeded.

___

### getAuthorizationMethod

▸ **getAuthorizationMethod**(): `Object`

Returns voter authorization mode from the election configuration.

#### Returns

`Object`

Returns an object with the method name, and the reference to the function.
Available method names are
* [authenticateWithCodes](avclient.md#authenticatewithcodes) for authentication via election codes.
* [ensureAuthorization](avclient.md#ensureauthorization) for authorization via OTPs.

| Name | Type |
| :------ | :------ |
| `method` | `Function` |
| `methodName` | `string` |

___

### getNumberOfOTPs

▸ **getNumberOfOTPs**(): `Promise`<`number`\>

Returns number of one time passwords (OTPs) that voter should enter to authorize.
Number comes from election config on the bulletin board.

#### Returns

`Promise`<`number`\>

Number of OTPs.

___

### startBenalohChallenge

▸ **startBenalohChallenge**(): `Promise`<[`ContestIndexed`](../interfaces/contestindexed.md)<`string`\>\>

This should be called when the voter chooses to test the encryption of their ballot.

The exact process is in development.

#### Returns

`Promise`<[`ContestIndexed`](../interfaces/contestindexed.md)<`string`\>\>

Returns a list of randomizers, that the digital ballot box generates.

___

### submitEncryptedBallot

▸ **submitEncryptedBallot**(`affidavit`): `Promise`<[`Receipt`](../modules.md#receipt)\>

This should be the last call in the entire voting process.

Submits encrypted ballot and the affidavit to the digital ballot box.

#### Parameters

| Name | Type |
| :------ | :------ |
| `affidavit` | `string` |

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
