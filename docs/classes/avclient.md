[@aion-dk/js-client](../README.md) / [Exports](../modules.md) / AVClient

# Class: AVClient

Assembly Voting Client API.

Expected sequence of methods being executed:
* [authenticateWithCodes](avclient.md#authenticatewithcodes)
* [getBallotList](avclient.md#getballotlist)
* [getBallot](avclient.md#getballot)
* [submitBallotChoices](avclient.md#submitballotchoices)
* [submitAttestation](avclient.md#submitattestation)
* [encryptCVR](avclient.md#encryptcvr)
* [cryptogramsForConfirmation](avclient.md#cryptogramsforconfirmation)
* [submissionReceipt](avclient.md#submissionreceipt)

## Table of contents

### Constructors

- [constructor](avclient.md#constructor)

### Properties

- [authorizationTokens](avclient.md#authorizationtokens)
- [bulletinBoard](avclient.md#bulletinboard)
- [electionConfig](avclient.md#electionconfig)
- [emptyCryptograms](avclient.md#emptycryptograms)
- [keyPair](avclient.md#keypair)
- [voteEncryptions](avclient.md#voteencryptions)
- [voteReceipt](avclient.md#votereceipt)
- [voterIdentifier](avclient.md#voteridentifier)

### Methods

- [authenticateWithCodes](avclient.md#authenticatewithcodes)
- [contestIds](avclient.md#contestids)
- [cryptogramsForConfirmation](avclient.md#cryptogramsforconfirmation)
- [electionEncryptionKey](avclient.md#electionencryptionkey)
- [electionId](avclient.md#electionid)
- [electionSigningPublicKey](avclient.md#electionsigningpublickey)
- [encryptCVR](avclient.md#encryptcvr)
- [finalizeAuthorization](avclient.md#finalizeauthorization)
- [getBallot](avclient.md#getballot)
- [getBallotList](avclient.md#getballotlist)
- [getNumberOfOTPs](avclient.md#getnumberofotps)
- [hasAuthorizedPublicKey](avclient.md#hasauthorizedpublickey)
- [initiateDigitalReturn](avclient.md#initiatedigitalreturn)
- [privateKey](avclient.md#privatekey)
- [publicKey](avclient.md#publickey)
- [requestOTPs](avclient.md#requestotps)
- [signAndSubmitEncryptedVotes](avclient.md#signandsubmitencryptedvotes)
- [startBenalohChallenge](avclient.md#startbenalohchallenge)
- [submissionReceipt](avclient.md#submissionreceipt)
- [submitAttestation](avclient.md#submitattestation)
- [submitBallotChoices](avclient.md#submitballotchoices)
- [updateElectionConfig](avclient.md#updateelectionconfig)

## Constructors

### constructor

• **new AVClient**(`bulletinBoardURL`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bulletinBoardURL` | `string` | URL to the Assembly Voting backend server, specific for election. |

#### Defined in

[av_client.ts:34](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L34)

## Properties

### authorizationTokens

• `Private` **authorizationTokens**: `any`[]

#### Defined in

[av_client.ts:27](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L27)

___

### bulletinBoard

• `Private` **bulletinBoard**: `any`

#### Defined in

[av_client.ts:28](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L28)

___

### electionConfig

• `Private` **electionConfig**: `any`

#### Defined in

[av_client.ts:29](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L29)

___

### emptyCryptograms

• `Private` **emptyCryptograms**: `any`

#### Defined in

[av_client.ts:30](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L30)

___

### keyPair

• `Private` **keyPair**: `KeyPair`

#### Defined in

[av_client.ts:31](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L31)

___

### voteEncryptions

• `Private` **voteEncryptions**: `any`

#### Defined in

[av_client.ts:32](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L32)

___

### voteReceipt

• `Private` **voteReceipt**: `any`

#### Defined in

[av_client.ts:33](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L33)

___

### voterIdentifier

• `Private` **voterIdentifier**: `string`

#### Defined in

[av_client.ts:34](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L34)

## Methods

### authenticateWithCodes

▸ **authenticateWithCodes**(`codes`): `Promise`<`string`\>

Authenticates or rejects voter, based on their submitted election codes.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `codes` | `string`[] | Array of election code strings. |

#### Returns

`Promise`<`string`\>

#### Defined in

[av_client.ts:48](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L48)

___

### contestIds

▸ `Private` **contestIds**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:266](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L266)

___

### cryptogramsForConfirmation

▸ **cryptogramsForConfirmation**(): `Object`

Returns data for rendering the list of cryptograms of the ballot

#### Returns

`Object`

Object containing a cryptogram for each contest

#### Defined in

[av_client.ts:202](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L202)

___

### electionEncryptionKey

▸ `Private` **electionEncryptionKey**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:270](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L270)

___

### electionId

▸ `Private` **electionId**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:262](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L262)

___

### electionSigningPublicKey

▸ `Private` **electionSigningPublicKey**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:274](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L274)

___

### encryptCVR

▸ **encryptCVR**(`cvr`): `Promise`<`any`\>

Encrypts a CVR and generates vote cryptograms.
CVR format is expected to be an object with `contestId` as keys and `option_handle` as values.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cvr` | `ContestIndexed`<`string`\> | Object containing the selections for each contest |

#### Returns

`Promise`<`any`\>

the cryptograms fingerprint

#### Defined in

[av_client.ts:159](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L159)

___

### finalizeAuthorization

▸ **finalizeAuthorization**(`otpCodes`): `Promise`<`string`\>

Takes the OTP codes.
Generates a new key pair.
Calls each OTP provider to authorize the public key by sending the according OTP code.

#### Parameters

| Name | Type |
| :------ | :------ |
| `otpCodes` | `string`[] |

#### Returns

`Promise`<`string`\>

#### Defined in

[av_client.ts:91](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L91)

___

### getBallot

▸ **getBallot**(`id`): `Object`

Returns data for rendering an entire ballot, for voter to make choices

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `any` |

#### Returns

`Object`

#### Defined in

[av_client.ts:130](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L130)

___

### getBallotList

▸ **getBallotList**(): `never`[]

Returns data for rendering a list of ballots

#### Returns

`never`[]

Array of ballot information objects

#### Defined in

[av_client.ts:123](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L123)

___

### getNumberOfOTPs

▸ **getNumberOfOTPs**(): `Promise`<`number`\>

Returns number of OTPs (one time passwords), voter should enter to authorize.
Number comes from election config on the bulletin board.

#### Returns

`Promise`<`number`\>

Promise<Number>

#### Defined in

[av_client.ts:80](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L80)

___

### hasAuthorizedPublicKey

▸ `Private` **hasAuthorizedPublicKey**(): `Promise`<`boolean`\>

#### Returns

`Promise`<`boolean`\>

#### Defined in

[av_client.ts:282](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L282)

___

### initiateDigitalReturn

▸ **initiateDigitalReturn**(`personalIdentificationInformation`): `Promise`<`string`\>

Takes PII, checks if an authorized public key already exists, and if so, returns true.
If not, sends it to Voter Authorization Coordinator Service, for it
to initiate Voter Authorizers to send out OTPs to the voter.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `personalIdentificationInformation` | `string` | We don't know what this will be yet. |

#### Returns

`Promise`<`string`\>

#### Defined in

[av_client.ts:66](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L66)

___

### privateKey

▸ `Private` **privateKey**(): `string`

#### Returns

`string`

#### Defined in

[av_client.ts:278](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L278)

___

### publicKey

▸ `Private` **publicKey**(): `string`

#### Returns

`string`

#### Defined in

[av_client.ts:288](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L288)

___

### requestOTPs

▸ `Private` **requestOTPs**(`personalIdentificationInformation`): `Promise`<`any`\>

Takes PII, sends it to Voter Authorization Coordinator Service, for it
to initiate Voter Authorizers to send out OTPs to the voter.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `personalIdentificationInformation` | `string` | We don't know what this will be yet. |

#### Returns

`Promise`<`any`\>

#### Defined in

[av_client.ts:253](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L253)

___

### signAndSubmitEncryptedVotes

▸ **signAndSubmitEncryptedVotes**(): `Promise`<`Object`\>

Prepares the vote submission package.
Submits encrypted voter ballot choices to backend server.

#### Returns

`Promise`<`Object`\>

Returns the vote receipt as a promise.

#### Defined in

[av_client.ts:217](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L217)

___

### startBenalohChallenge

▸ **startBenalohChallenge**(): `Promise`<`any`\>

#### Returns

`Promise`<`any`\>

#### Defined in

[av_client.ts:194](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L194)

___

### submissionReceipt

▸ **submissionReceipt**(): `Object`

#### Returns

`Object`

#### Defined in

[av_client.ts:235](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L235)

___

### submitAttestation

▸ **submitAttestation**(`attestation`): `Promise`<`boolean`\>

Submits attestation object to be manually reviewed later

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `attestation` | `any` | Attestation object to be submitted |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[av_client.ts:149](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L149)

___

### submitBallotChoices

▸ **submitBallotChoices**(`ballotId`, `choices`): `Promise`<`boolean`\>

Submits voter ballot choices to backend server.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ballotId` | `any` | ID of the ballot being submitted |
| `choices` | `any` | Voter choices for the ballot |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[av_client.ts:140](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L140)

___

### updateElectionConfig

▸ `Private` **updateElectionConfig**(): `Promise`<`void`\>

Attempts to populate election configuration data from backend server, if it hasn't been populated yet.

#### Returns

`Promise`<`void`\>

#### Defined in

[av_client.ts:242](https://github.com/aion-dk/js-client/blob/27f87a6/lib/av_client.ts#L242)
