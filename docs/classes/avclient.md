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
- [startBenalohChallenge](avclient.md#startbenalohchallenge)
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

[av_client.ts:25](https://github.com/aion-dk/js-client/blob/3cb7974/lib/av_client.ts#L25)

## Properties

### connector

• `Private` **connector**: `any`

#### Defined in

[av_client.ts:24](https://github.com/aion-dk/js-client/blob/3cb7974/lib/av_client.ts#L24)

___

### electionConfig

• `Private` **electionConfig**: `any`

#### Defined in

[av_client.ts:25](https://github.com/aion-dk/js-client/blob/3cb7974/lib/av_client.ts#L25)

___

### storage

• `Private` **storage**: [`Storage`](../interfaces/storage.md)

#### Defined in

[av_client.ts:23](https://github.com/aion-dk/js-client/blob/3cb7974/lib/av_client.ts#L23)

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

[av_client.ts:41](https://github.com/aion-dk/js-client/blob/3cb7974/lib/av_client.ts#L41)

___

### contestIds

▸ `Private` **contestIds**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:187](https://github.com/aion-dk/js-client/blob/3cb7974/lib/av_client.ts#L187)

___

### cryptogramsForConfirmation

▸ **cryptogramsForConfirmation**(): `Object`

Returns data for rendering the list of cryptograms of the ballot

#### Returns

`Object`

Object containing a cryptogram for each contest

#### Defined in

[av_client.ts:114](https://github.com/aion-dk/js-client/blob/3cb7974/lib/av_client.ts#L114)

___

### electionEncryptionKey

▸ `Private` **electionEncryptionKey**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:191](https://github.com/aion-dk/js-client/blob/3cb7974/lib/av_client.ts#L191)

___

### electionId

▸ `Private` **electionId**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:183](https://github.com/aion-dk/js-client/blob/3cb7974/lib/av_client.ts#L183)

___

### electionSigningPublicKey

▸ `Private` **electionSigningPublicKey**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:195](https://github.com/aion-dk/js-client/blob/3cb7974/lib/av_client.ts#L195)

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

[av_client.ts:93](https://github.com/aion-dk/js-client/blob/3cb7974/lib/av_client.ts#L93)

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

[av_client.ts:65](https://github.com/aion-dk/js-client/blob/3cb7974/lib/av_client.ts#L65)

___

### getBallotList

▸ **getBallotList**(): `any`[]

Returns data for rendering a list of ballots

#### Returns

`any`[]

Array of ballot information objects

#### Defined in

[av_client.ts:58](https://github.com/aion-dk/js-client/blob/3cb7974/lib/av_client.ts#L58)

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

[av_client.ts:167](https://github.com/aion-dk/js-client/blob/3cb7974/lib/av_client.ts#L167)

___

### privateKey

▸ `Private` **privateKey**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:199](https://github.com/aion-dk/js-client/blob/3cb7974/lib/av_client.ts#L199)

___

### signAndSubmitEncryptedVotes

▸ **signAndSubmitEncryptedVotes**(): `Promise`<`string`\>

Prepares the vote submission package.
Submits encrypted voter ballot choices to backend server.
Stores the vote receipt in the storage.

#### Returns

`Promise`<`string`\>

#### Defined in

[av_client.ts:130](https://github.com/aion-dk/js-client/blob/3cb7974/lib/av_client.ts#L130)

___

### startBenalohChallenge

▸ **startBenalohChallenge**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

[av_client.ts:102](https://github.com/aion-dk/js-client/blob/3cb7974/lib/av_client.ts#L102)

___

### submissionReceipt

▸ **submissionReceipt**(): `Object`

#### Returns

`Object`

#### Defined in

[av_client.ts:151](https://github.com/aion-dk/js-client/blob/3cb7974/lib/av_client.ts#L151)

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

[av_client.ts:84](https://github.com/aion-dk/js-client/blob/3cb7974/lib/av_client.ts#L84)

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

[av_client.ts:75](https://github.com/aion-dk/js-client/blob/3cb7974/lib/av_client.ts#L75)

___

### updateElectionConfig

▸ `Private` **updateElectionConfig**(): `Promise`<`void`\>

Attempts to populate election configuration data from backend server, if it hasn't been populated yet.

#### Returns

`Promise`<`void`\>

#### Defined in

[av_client.ts:158](https://github.com/aion-dk/js-client/blob/3cb7974/lib/av_client.ts#L158)
