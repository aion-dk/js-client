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

- [authorizationTokens](avclient.md#authorizationtokens)
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
- [finalizeAuthorization](avclient.md#finalizeauthorization)
- [getBallot](avclient.md#getballot)
- [getBallotList](avclient.md#getballotlist)
- [prepareDataForEncryption](avclient.md#preparedataforencryption)
- [privateKey](avclient.md#privatekey)
- [publicKey](avclient.md#publickey)
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

[av_client.ts:34](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L34)

## Properties

### authorizationTokens

• `Private` **authorizationTokens**: `any`[]

#### Defined in

[av_client.ts:26](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L26)

___

### bulletinBoard

• `Private` **bulletinBoard**: `any`

#### Defined in

[av_client.ts:27](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L27)

___

### electionConfig

• `Private` **electionConfig**: `any`

#### Defined in

[av_client.ts:28](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L28)

___

### emptyCryptograms

• `Private` **emptyCryptograms**: `any`

#### Defined in

[av_client.ts:29](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L29)

___

### keyPair

• `Private` **keyPair**: `KeyPair`

#### Defined in

[av_client.ts:30](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L30)

___

### voteEncryptions

• `Private` **voteEncryptions**: `any`

#### Defined in

[av_client.ts:31](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L31)

___

### voteReceipt

• `Private` **voteReceipt**: `any`

#### Defined in

[av_client.ts:33](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L33)

___

### voterAuthorizationCoordinator

• `Private` **voterAuthorizationCoordinator**: `any`

#### Defined in

[av_client.ts:32](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L32)

___

### voterIdentifier

• `Private` **voterIdentifier**: `string`

#### Defined in

[av_client.ts:34](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L34)

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

[av_client.ts:48](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L48)

___

### contestIds

▸ `Private` **contestIds**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:240](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L240)

___

### cryptogramsForConfirmation

▸ **cryptogramsForConfirmation**(): `Object`

Returns data for rendering the list of cryptograms of the ballot

#### Returns

`Object`

Object containing a cryptogram for each contest

#### Defined in

[av_client.ts:165](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L165)

___

### electionEncryptionKey

▸ `Private` **electionEncryptionKey**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:244](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L244)

___

### electionId

▸ `Private` **electionId**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:236](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L236)

___

### electionSigningPublicKey

▸ `Private` **electionSigningPublicKey**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:248](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L248)

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

[av_client.ts:148](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L148)

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

[av_client.ts:83](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L83)

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

[av_client.ts:120](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L120)

___

### getBallotList

▸ **getBallotList**(): `any`[]

Returns data for rendering a list of ballots

#### Returns

`any`[]

Array of ballot information objects

#### Defined in

[av_client.ts:113](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L113)

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

[av_client.ts:220](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L220)

___

### privateKey

▸ `Private` **privateKey**(): `string`

#### Returns

`string`

#### Defined in

[av_client.ts:252](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L252)

___

### publicKey

▸ `Private` **publicKey**(): `string`

#### Returns

`string`

#### Defined in

[av_client.ts:256](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L256)

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

[av_client.ts:65](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L65)

___

### setupVoterAuthorizationCoordinator

▸ `Private` **setupVoterAuthorizationCoordinator**(): `void`

#### Returns

`void`

#### Defined in

[av_client.ts:211](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L211)

___

### signAndSubmitEncryptedVotes

▸ **signAndSubmitEncryptedVotes**(): `Promise`<`Object`\>

Prepares the vote submission package.
Submits encrypted voter ballot choices to backend server.

#### Returns

`Promise`<`Object`\>

Returns the vote receipt as a promise.

#### Defined in

[av_client.ts:180](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L180)

___

### startBenalohChallenge

▸ **startBenalohChallenge**(): `Promise`<`any`\>

#### Returns

`Promise`<`any`\>

#### Defined in

[av_client.ts:157](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L157)

___

### submissionReceipt

▸ **submissionReceipt**(): `Object`

#### Returns

`Object`

#### Defined in

[av_client.ts:198](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L198)

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

[av_client.ts:139](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L139)

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

[av_client.ts:130](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L130)

___

### updateElectionConfig

▸ `Private` **updateElectionConfig**(): `Promise`<`void`\>

Attempts to populate election configuration data from backend server, if it hasn't been populated yet.

#### Returns

`Promise`<`void`\>

#### Defined in

[av_client.ts:205](https://github.com/aion-dk/js-client/blob/e404653/lib/av_client.ts#L205)
