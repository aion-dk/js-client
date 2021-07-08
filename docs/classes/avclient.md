[assembly-voting-client](../README.md) / [Exports](../modules.md) / AVClient

# Class: AVClient

Assembly Voting Client API.

Expected sequence of methods being executed:
* [authenticateWithCodes](avclient.md#authenticatewithcodes)
* [getBallotList](avclient.md#getballotlist)
* [getBallot](avclient.md#getballot)
* [submitBallotChoices](avclient.md#submitballotchoices)
* [submitAttestation](avclient.md#submitattestation)
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
- [cryptogramsForConfirmation](avclient.md#cryptogramsforconfirmation)
- [electionEncryptionKey](avclient.md#electionencryptionkey)
- [electionId](avclient.md#electionid)
- [getBallot](avclient.md#getballot)
- [getBallotList](avclient.md#getballotlist)
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

[av_client.ts:20](https://github.com/aion-dk/js-client/blob/f5094e2/lib/av_client.ts#L20)

## Properties

### connector

• `Private` **connector**: `any`

#### Defined in

[av_client.ts:19](https://github.com/aion-dk/js-client/blob/f5094e2/lib/av_client.ts#L19)

___

### electionConfig

• `Private` **electionConfig**: `object`

#### Defined in

[av_client.ts:20](https://github.com/aion-dk/js-client/blob/f5094e2/lib/av_client.ts#L20)

___

### storage

• `Private` **storage**: [`Storage`](../interfaces/storage.md)

#### Defined in

[av_client.ts:18](https://github.com/aion-dk/js-client/blob/f5094e2/lib/av_client.ts#L18)

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

[av_client.ts:36](https://github.com/aion-dk/js-client/blob/f5094e2/lib/av_client.ts#L36)

___

### cryptogramsForConfirmation

▸ **cryptogramsForConfirmation**(): `any`[]

#### Returns

`any`[]

#### Defined in

[av_client.ts:82](https://github.com/aion-dk/js-client/blob/f5094e2/lib/av_client.ts#L82)

___

### electionEncryptionKey

▸ `Private` **electionEncryptionKey**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:103](https://github.com/aion-dk/js-client/blob/f5094e2/lib/av_client.ts#L103)

___

### electionId

▸ `Private` **electionId**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:99](https://github.com/aion-dk/js-client/blob/f5094e2/lib/av_client.ts#L99)

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

[av_client.ts:59](https://github.com/aion-dk/js-client/blob/f5094e2/lib/av_client.ts#L59)

___

### getBallotList

▸ **getBallotList**(): `any`[]

Returns data for rendering a list of ballots

#### Returns

`any`[]

Array of ballot information objects

#### Defined in

[av_client.ts:52](https://github.com/aion-dk/js-client/blob/f5094e2/lib/av_client.ts#L52)

___

### submissionReceipt

▸ **submissionReceipt**(): `Object`

#### Returns

`Object`

#### Defined in

[av_client.ts:86](https://github.com/aion-dk/js-client/blob/f5094e2/lib/av_client.ts#L86)

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

[av_client.ts:78](https://github.com/aion-dk/js-client/blob/f5094e2/lib/av_client.ts#L78)

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

[av_client.ts:69](https://github.com/aion-dk/js-client/blob/f5094e2/lib/av_client.ts#L69)

___

### updateElectionConfig

▸ `Private` **updateElectionConfig**(): `Promise`<`void`\>

Attempts to populate election configuration data from backend server, if it hasn't been populated yet.

#### Returns

`Promise`<`void`\>

#### Defined in

[av_client.ts:93](https://github.com/aion-dk/js-client/blob/f5094e2/lib/av_client.ts#L93)
