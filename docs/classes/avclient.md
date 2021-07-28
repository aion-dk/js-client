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

- [connector](avclient.md#connector)
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
- [encryptContestSelections](avclient.md#encryptcontestselections)
- [getBallot](avclient.md#getballot)
- [getBallotList](avclient.md#getballotlist)
- [prepareDataForEncryption](avclient.md#preparedataforencryption)
- [privateKey](avclient.md#privatekey)
- [requestOTPs](avclient.md#requestotps)
- [signAndSubmitEncryptedVotes](avclient.md#signandsubmitencryptedvotes)
- [startBenalohChallenge](avclient.md#startbenalohchallenge)
- [submissionReceipt](avclient.md#submissionreceipt)
- [submitAttestation](avclient.md#submitattestation)
- [submitBallotChoices](avclient.md#submitballotchoices)
- [updateElectionConfig](avclient.md#updateelectionconfig)

## Constructors

### constructor

• **new AVClient**(`backendUrl`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `backendUrl` | `string` | URL to the Assembly Voting backend server, specific for election. |

#### Defined in

[av_client.ts:29](https://github.com/aion-dk/js-client/blob/90c8b3b/lib/av_client.ts#L29)

## Properties

### connector

• `Private` **connector**: `any`

#### Defined in

[av_client.ts:23](https://github.com/aion-dk/js-client/blob/90c8b3b/lib/av_client.ts#L23)

___

### electionConfig

• `Private` **electionConfig**: `any`

#### Defined in

[av_client.ts:24](https://github.com/aion-dk/js-client/blob/90c8b3b/lib/av_client.ts#L24)

___

### emptyCryptograms

• `Private` **emptyCryptograms**: `any`

#### Defined in

[av_client.ts:27](https://github.com/aion-dk/js-client/blob/90c8b3b/lib/av_client.ts#L27)

___

### keyPair

• `Private` **keyPair**: `KeyPair`

#### Defined in

[av_client.ts:26](https://github.com/aion-dk/js-client/blob/90c8b3b/lib/av_client.ts#L26)

___

### voteEncryptions

• `Private` **voteEncryptions**: `any`

#### Defined in

[av_client.ts:28](https://github.com/aion-dk/js-client/blob/90c8b3b/lib/av_client.ts#L28)

___

### voteReceipt

• `Private` **voteReceipt**: `any`

#### Defined in

[av_client.ts:29](https://github.com/aion-dk/js-client/blob/90c8b3b/lib/av_client.ts#L29)

___

### voterIdentifier

• `Private` **voterIdentifier**: `string`

#### Defined in

[av_client.ts:25](https://github.com/aion-dk/js-client/blob/90c8b3b/lib/av_client.ts#L25)

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

[av_client.ts:43](https://github.com/aion-dk/js-client/blob/90c8b3b/lib/av_client.ts#L43)

___

### contestIds

▸ `Private` **contestIds**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:200](https://github.com/aion-dk/js-client/blob/90c8b3b/lib/av_client.ts#L200)

___

### cryptogramsForConfirmation

▸ **cryptogramsForConfirmation**(): `Object`

Returns data for rendering the list of cryptograms of the ballot

#### Returns

`Object`

Object containing a cryptogram for each contest

#### Defined in

[av_client.ts:128](https://github.com/aion-dk/js-client/blob/90c8b3b/lib/av_client.ts#L128)

___

### electionEncryptionKey

▸ `Private` **electionEncryptionKey**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:204](https://github.com/aion-dk/js-client/blob/90c8b3b/lib/av_client.ts#L204)

___

### electionId

▸ `Private` **electionId**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:196](https://github.com/aion-dk/js-client/blob/90c8b3b/lib/av_client.ts#L196)

___

### electionSigningPublicKey

▸ `Private` **electionSigningPublicKey**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:208](https://github.com/aion-dk/js-client/blob/90c8b3b/lib/av_client.ts#L208)

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

[av_client.ts:111](https://github.com/aion-dk/js-client/blob/90c8b3b/lib/av_client.ts#L111)

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

[av_client.ts:83](https://github.com/aion-dk/js-client/blob/90c8b3b/lib/av_client.ts#L83)

___

### getBallotList

▸ **getBallotList**(): `any`[]

Returns data for rendering a list of ballots

#### Returns

`any`[]

Array of ballot information objects

#### Defined in

[av_client.ts:76](https://github.com/aion-dk/js-client/blob/90c8b3b/lib/av_client.ts#L76)

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

[av_client.ts:180](https://github.com/aion-dk/js-client/blob/90c8b3b/lib/av_client.ts#L180)

___

### privateKey

▸ `Private` **privateKey**(): `string`

#### Returns

`string`

#### Defined in

[av_client.ts:212](https://github.com/aion-dk/js-client/blob/90c8b3b/lib/av_client.ts#L212)

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

[av_client.ts:60](https://github.com/aion-dk/js-client/blob/90c8b3b/lib/av_client.ts#L60)

___

### signAndSubmitEncryptedVotes

▸ **signAndSubmitEncryptedVotes**(): `Promise`<`Object`\>

Prepares the vote submission package.
Submits encrypted voter ballot choices to backend server.

#### Returns

`Promise`<`Object`\>

Returns the vote receipt as a promise.

#### Defined in

[av_client.ts:143](https://github.com/aion-dk/js-client/blob/90c8b3b/lib/av_client.ts#L143)

___

### startBenalohChallenge

▸ **startBenalohChallenge**(): `Promise`<`any`\>

#### Returns

`Promise`<`any`\>

#### Defined in

[av_client.ts:120](https://github.com/aion-dk/js-client/blob/90c8b3b/lib/av_client.ts#L120)

___

### submissionReceipt

▸ **submissionReceipt**(): `Object`

#### Returns

`Object`

#### Defined in

[av_client.ts:161](https://github.com/aion-dk/js-client/blob/90c8b3b/lib/av_client.ts#L161)

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

[av_client.ts:102](https://github.com/aion-dk/js-client/blob/90c8b3b/lib/av_client.ts#L102)

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

[av_client.ts:93](https://github.com/aion-dk/js-client/blob/90c8b3b/lib/av_client.ts#L93)

___

### updateElectionConfig

▸ `Private` **updateElectionConfig**(): `Promise`<`void`\>

Attempts to populate election configuration data from backend server, if it hasn't been populated yet.

#### Returns

`Promise`<`void`\>

#### Defined in

[av_client.ts:168](https://github.com/aion-dk/js-client/blob/90c8b3b/lib/av_client.ts#L168)
