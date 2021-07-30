[@aion-dk/js-client](../README.md) / [Exports](../modules.md) / AVClient

# Class: AVClient

Assembly Voting Client API.

Expected sequence of methods being executed:
* [authenticateWithCodes](avclient.md#authenticatewithcodes)
* [getBallotList](avclient.md#getballotlist)
* [getBallot](avclient.md#getballot)
* [submitBallotChoices](avclient.md#submitballotchoices)
* [submitAttestation](avclient.md#submitattestation)
* [encryptContestSelections](avclient.md#encryptcontestselections)
* [cryptogramsForConfirmation](avclient.md#cryptogramsforconfirmation)
* [submissionReceipt](avclient.md#submissionreceipt)

## Table of contents

### Constructors

- [constructor](avclient.md#constructor)

### Properties

- [bulletinBoard](avclient.md#bulletinboard)
- [electionConfig](avclient.md#electionconfig)
- [emptyCryptograms](avclient.md#emptycryptograms)
- [keyPair](avclient.md#keypair)
- [voteEncryptions](avclient.md#voteencryptions)
- [voteReceipt](avclient.md#votereceipt)
- [voterAuthorizationCoordinator](avclient.md#voterauthorizationcoordinator)
- [voterIdentifier](avclient.md#voteridentifier)

### Methods

- [authenticateWithCodes](avclient.md#authenticatewithcodes)
- [contestIds](avclient.md#contestids)
- [cryptogramsForConfirmation](avclient.md#cryptogramsforconfirmation)
- [electionEncryptionKey](avclient.md#electionencryptionkey)
- [electionId](avclient.md#electionid)
- [electionSigningPublicKey](avclient.md#electionsigningpublickey)
- [encryptContestSelections](avclient.md#encryptcontestselections)
- [getBallot](avclient.md#getballot)
- [getBallotList](avclient.md#getballotlist)
- [prepareDataForEncryption](avclient.md#preparedataforencryption)
- [privateKey](avclient.md#privatekey)
- [requestOTPs](avclient.md#requestotps)
- [setupVoterAuthorizationCoordinator](avclient.md#setupvoterauthorizationcoordinator)
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

[av_client.ts:31](https://github.com/aion-dk/js-client/blob/bef4c32/lib/av_client.ts#L31)

## Properties

### bulletinBoard

• `Private` **bulletinBoard**: `any`

#### Defined in

[av_client.ts:24](https://github.com/aion-dk/js-client/blob/bef4c32/lib/av_client.ts#L24)

___

### electionConfig

• `Private` **electionConfig**: `any`

#### Defined in

[av_client.ts:25](https://github.com/aion-dk/js-client/blob/bef4c32/lib/av_client.ts#L25)

___

### emptyCryptograms

• `Private` **emptyCryptograms**: `any`

#### Defined in

[av_client.ts:26](https://github.com/aion-dk/js-client/blob/bef4c32/lib/av_client.ts#L26)

___

### keyPair

• `Private` **keyPair**: `KeyPair`

#### Defined in

[av_client.ts:27](https://github.com/aion-dk/js-client/blob/bef4c32/lib/av_client.ts#L27)

___

### voteEncryptions

• `Private` **voteEncryptions**: `any`

#### Defined in

[av_client.ts:28](https://github.com/aion-dk/js-client/blob/bef4c32/lib/av_client.ts#L28)

___

### voteReceipt

• `Private` **voteReceipt**: `any`

#### Defined in

[av_client.ts:30](https://github.com/aion-dk/js-client/blob/bef4c32/lib/av_client.ts#L30)

___

### voterAuthorizationCoordinator

• `Private` **voterAuthorizationCoordinator**: `any`

#### Defined in

[av_client.ts:29](https://github.com/aion-dk/js-client/blob/bef4c32/lib/av_client.ts#L29)

___

### voterIdentifier

• `Private` **voterIdentifier**: `string`

#### Defined in

[av_client.ts:31](https://github.com/aion-dk/js-client/blob/bef4c32/lib/av_client.ts#L31)

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

[av_client.ts:45](https://github.com/aion-dk/js-client/blob/bef4c32/lib/av_client.ts#L45)

___

### contestIds

▸ `Private` **contestIds**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:206](https://github.com/aion-dk/js-client/blob/bef4c32/lib/av_client.ts#L206)

___

### cryptogramsForConfirmation

▸ **cryptogramsForConfirmation**(): `Object`

Returns data for rendering the list of cryptograms of the ballot

#### Returns

`Object`

Object containing a cryptogram for each contest

#### Defined in

[av_client.ts:131](https://github.com/aion-dk/js-client/blob/bef4c32/lib/av_client.ts#L131)

___

### electionEncryptionKey

▸ `Private` **electionEncryptionKey**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:210](https://github.com/aion-dk/js-client/blob/bef4c32/lib/av_client.ts#L210)

___

### electionId

▸ `Private` **electionId**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:202](https://github.com/aion-dk/js-client/blob/bef4c32/lib/av_client.ts#L202)

___

### electionSigningPublicKey

▸ `Private` **electionSigningPublicKey**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:214](https://github.com/aion-dk/js-client/blob/bef4c32/lib/av_client.ts#L214)

___

### encryptContestSelections

▸ **encryptContestSelections**(`contestSelections`): `string`

Encrypts all voter ballot choices.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `contestSelections` | `ContestIndexed`<`string`\> | Object containing the selections for each contest |

#### Returns

`string`

#### Defined in

[av_client.ts:114](https://github.com/aion-dk/js-client/blob/bef4c32/lib/av_client.ts#L114)

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

[av_client.ts:86](https://github.com/aion-dk/js-client/blob/bef4c32/lib/av_client.ts#L86)

___

### getBallotList

▸ **getBallotList**(): `any`[]

Returns data for rendering a list of ballots

#### Returns

`any`[]

Array of ballot information objects

#### Defined in

[av_client.ts:79](https://github.com/aion-dk/js-client/blob/bef4c32/lib/av_client.ts#L79)

___

### prepareDataForEncryption

▸ `Private` **prepareDataForEncryption**(`contestSelections`): `Object`

Gathers all data needed for encrypting the vote selections.

#### Parameters

| Name | Type |
| :------ | :------ |
| `contestSelections` | `ContestIndexed`<`string`\> |

#### Returns

`Object`

#### Defined in

[av_client.ts:186](https://github.com/aion-dk/js-client/blob/bef4c32/lib/av_client.ts#L186)

___

### privateKey

▸ `Private` **privateKey**(): `string`

#### Returns

`string`

#### Defined in

[av_client.ts:218](https://github.com/aion-dk/js-client/blob/bef4c32/lib/av_client.ts#L218)

___

### requestOTPs

▸ **requestOTPs**(`personalIdentificationInformation`): `Promise`<`any`\>

Takes PII, sends it to Voter Authorization Coordinator Service, for it
to initiate Voter Authorizers to send out OTPs to the voter.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `personalIdentificationInformation` | `string` | We don't know what this will be yet. |

#### Returns

`Promise`<`any`\>

#### Defined in

[av_client.ts:62](https://github.com/aion-dk/js-client/blob/bef4c32/lib/av_client.ts#L62)

___

### setupVoterAuthorizationCoordinator

▸ `Private` **setupVoterAuthorizationCoordinator**(): `void`

#### Returns

`void`

#### Defined in

[av_client.ts:177](https://github.com/aion-dk/js-client/blob/bef4c32/lib/av_client.ts#L177)

___

### signAndSubmitEncryptedVotes

▸ **signAndSubmitEncryptedVotes**(): `Promise`<`Object`\>

Prepares the vote submission package.
Submits encrypted voter ballot choices to backend server.

#### Returns

`Promise`<`Object`\>

Returns the vote receipt as a promise.

#### Defined in

[av_client.ts:146](https://github.com/aion-dk/js-client/blob/bef4c32/lib/av_client.ts#L146)

___

### startBenalohChallenge

▸ **startBenalohChallenge**(): `Promise`<`any`\>

#### Returns

`Promise`<`any`\>

#### Defined in

[av_client.ts:123](https://github.com/aion-dk/js-client/blob/bef4c32/lib/av_client.ts#L123)

___

### submissionReceipt

▸ **submissionReceipt**(): `Object`

#### Returns

`Object`

#### Defined in

[av_client.ts:164](https://github.com/aion-dk/js-client/blob/bef4c32/lib/av_client.ts#L164)

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

[av_client.ts:105](https://github.com/aion-dk/js-client/blob/bef4c32/lib/av_client.ts#L105)

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

[av_client.ts:96](https://github.com/aion-dk/js-client/blob/bef4c32/lib/av_client.ts#L96)

___

### updateElectionConfig

▸ `Private` **updateElectionConfig**(): `Promise`<`void`\>

Attempts to populate election configuration data from backend server, if it hasn't been populated yet.

#### Returns

`Promise`<`void`\>

#### Defined in

[av_client.ts:171](https://github.com/aion-dk/js-client/blob/bef4c32/lib/av_client.ts#L171)
