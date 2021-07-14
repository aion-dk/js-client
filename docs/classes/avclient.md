[assembly-voting-client](../README.md) / [Exports](../modules.md) / AVClient

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
- [encryptContestSelections](avclient.md#encryptcontestselections)
- [getBallot](avclient.md#getballot)
- [getBallotList](avclient.md#getballotlist)
- [prepareDataForEncryption](avclient.md#preparedataforencryption)
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

[av_client.ts:22](https://github.com/aion-dk/js-client/blob/b27f372/lib/av_client.ts#L22)

## Properties

### connector

• `Private` **connector**: `any`

#### Defined in

[av_client.ts:21](https://github.com/aion-dk/js-client/blob/b27f372/lib/av_client.ts#L21)

___

### electionConfig

• `Private` **electionConfig**: `object`

#### Defined in

[av_client.ts:22](https://github.com/aion-dk/js-client/blob/b27f372/lib/av_client.ts#L22)

___

### storage

• `Private` **storage**: [`Storage`](../interfaces/storage.md)

#### Defined in

[av_client.ts:20](https://github.com/aion-dk/js-client/blob/b27f372/lib/av_client.ts#L20)

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

[av_client.ts:38](https://github.com/aion-dk/js-client/blob/b27f372/lib/av_client.ts#L38)

___

### contestIds

▸ `Private` **contestIds**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:148](https://github.com/aion-dk/js-client/blob/b27f372/lib/av_client.ts#L148)

___

### cryptogramsForConfirmation

▸ **cryptogramsForConfirmation**(): `Object`

Returns data for rendering the list of cryptograms of the ballot

#### Returns

`Object`

Object containing a cryptogram for each contest

#### Defined in

[av_client.ts:102](https://github.com/aion-dk/js-client/blob/b27f372/lib/av_client.ts#L102)

___

### electionEncryptionKey

▸ `Private` **electionEncryptionKey**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:152](https://github.com/aion-dk/js-client/blob/b27f372/lib/av_client.ts#L152)

___

### electionId

▸ `Private` **electionId**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:144](https://github.com/aion-dk/js-client/blob/b27f372/lib/av_client.ts#L144)

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

[av_client.ts:89](https://github.com/aion-dk/js-client/blob/b27f372/lib/av_client.ts#L89)

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

[av_client.ts:61](https://github.com/aion-dk/js-client/blob/b27f372/lib/av_client.ts#L61)

___

### getBallotList

▸ **getBallotList**(): `any`[]

Returns data for rendering a list of ballots

#### Returns

`any`[]

Array of ballot information objects

#### Defined in

[av_client.ts:54](https://github.com/aion-dk/js-client/blob/b27f372/lib/av_client.ts#L54)

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

[av_client.ts:128](https://github.com/aion-dk/js-client/blob/b27f372/lib/av_client.ts#L128)

___

### submissionReceipt

▸ **submissionReceipt**(): `Object`

#### Returns

`Object`

#### Defined in

[av_client.ts:112](https://github.com/aion-dk/js-client/blob/b27f372/lib/av_client.ts#L112)

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

[av_client.ts:80](https://github.com/aion-dk/js-client/blob/b27f372/lib/av_client.ts#L80)

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

[av_client.ts:71](https://github.com/aion-dk/js-client/blob/b27f372/lib/av_client.ts#L71)

___

### updateElectionConfig

▸ `Private` **updateElectionConfig**(): `Promise`<`void`\>

Attempts to populate election configuration data from backend server, if it hasn't been populated yet.

#### Returns

`Promise`<`void`\>

#### Defined in

[av_client.ts:119](https://github.com/aion-dk/js-client/blob/b27f372/lib/av_client.ts#L119)
