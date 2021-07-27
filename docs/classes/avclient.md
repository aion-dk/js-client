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
- [storage](avclient.md#storage)

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
- [signAndSubmitEncryptedVotes](avclient.md#signandsubmitencryptedvotes)
- [submissionReceipt](avclient.md#submissionreceipt)
- [submitAttestation](avclient.md#submitattestation)
- [submitBallotChoices](avclient.md#submitballotchoices)
- [updateElectionConfig](avclient.md#updateelectionconfig)

## Constructors

### constructor

• **new AVClient**(`storage`, `backendUrl`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `storage` | [`Storage`](../interfaces/storage.md) | App developers' persistence interface that implements `get` and `set` methods. |
| `backendUrl` | `string` | URL to the Assembly Voting backend server, specific for election. |

#### Defined in

[av_client.ts:24](https://github.com/aion-dk/js-client/blob/6f47fca/lib/av_client.ts#L24)

## Properties

### connector

• `Private` **connector**: `any`

#### Defined in

[av_client.ts:23](https://github.com/aion-dk/js-client/blob/6f47fca/lib/av_client.ts#L23)

___

### electionConfig

• `Private` **electionConfig**: `any`

#### Defined in

[av_client.ts:24](https://github.com/aion-dk/js-client/blob/6f47fca/lib/av_client.ts#L24)

___

### storage

• `Private` **storage**: [`Storage`](../interfaces/storage.md)

#### Defined in

[av_client.ts:22](https://github.com/aion-dk/js-client/blob/6f47fca/lib/av_client.ts#L22)

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

[av_client.ts:40](https://github.com/aion-dk/js-client/blob/6f47fca/lib/av_client.ts#L40)

___

### contestIds

▸ `Private` **contestIds**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:178](https://github.com/aion-dk/js-client/blob/6f47fca/lib/av_client.ts#L178)

___

### cryptogramsForConfirmation

▸ **cryptogramsForConfirmation**(): `Object`

Returns data for rendering the list of cryptograms of the ballot

#### Returns

`Object`

Object containing a cryptogram for each contest

#### Defined in

[av_client.ts:105](https://github.com/aion-dk/js-client/blob/6f47fca/lib/av_client.ts#L105)

___

### electionEncryptionKey

▸ `Private` **electionEncryptionKey**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:182](https://github.com/aion-dk/js-client/blob/6f47fca/lib/av_client.ts#L182)

___

### electionId

▸ `Private` **electionId**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:174](https://github.com/aion-dk/js-client/blob/6f47fca/lib/av_client.ts#L174)

___

### electionSigningPublicKey

▸ `Private` **electionSigningPublicKey**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:186](https://github.com/aion-dk/js-client/blob/6f47fca/lib/av_client.ts#L186)

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

[av_client.ts:92](https://github.com/aion-dk/js-client/blob/6f47fca/lib/av_client.ts#L92)

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

[av_client.ts:64](https://github.com/aion-dk/js-client/blob/6f47fca/lib/av_client.ts#L64)

___

### getBallotList

▸ **getBallotList**(): `any`[]

Returns data for rendering a list of ballots

#### Returns

`any`[]

Array of ballot information objects

#### Defined in

[av_client.ts:57](https://github.com/aion-dk/js-client/blob/6f47fca/lib/av_client.ts#L57)

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

[av_client.ts:158](https://github.com/aion-dk/js-client/blob/6f47fca/lib/av_client.ts#L158)

___

### privateKey

▸ `Private` **privateKey**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:190](https://github.com/aion-dk/js-client/blob/6f47fca/lib/av_client.ts#L190)

___

### signAndSubmitEncryptedVotes

▸ **signAndSubmitEncryptedVotes**(): `Promise`<`string`\>

Prepares the vote submission package.
Submits encrypted voter ballot choices to backend server.
Stores the vote receipt in the storage.

#### Returns

`Promise`<`string`\>

#### Defined in

[av_client.ts:121](https://github.com/aion-dk/js-client/blob/6f47fca/lib/av_client.ts#L121)

___

### submissionReceipt

▸ **submissionReceipt**(): `Object`

#### Returns

`Object`

#### Defined in

[av_client.ts:142](https://github.com/aion-dk/js-client/blob/6f47fca/lib/av_client.ts#L142)

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

[av_client.ts:83](https://github.com/aion-dk/js-client/blob/6f47fca/lib/av_client.ts#L83)

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

[av_client.ts:74](https://github.com/aion-dk/js-client/blob/6f47fca/lib/av_client.ts#L74)

___

### updateElectionConfig

▸ `Private` **updateElectionConfig**(): `Promise`<`void`\>

Attempts to populate election configuration data from backend server, if it hasn't been populated yet.

#### Returns

`Promise`<`void`\>

#### Defined in

[av_client.ts:149](https://github.com/aion-dk/js-client/blob/6f47fca/lib/av_client.ts#L149)
