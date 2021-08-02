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
- [getNumberOfOTPs](avclient.md#getnumberofotps)
- [hasAuthorizedPublicKey](avclient.md#hasauthorizedpublickey)
- [initiateDigitalReturn](avclient.md#initiatedigitalreturn)
- [prepareDataForEncryption](avclient.md#preparedataforencryption)
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

[av_client.ts:33](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L33)

## Properties

### authorizationTokens

• `Private` **authorizationTokens**: `any`[]

#### Defined in

[av_client.ts:26](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L26)

___

### bulletinBoard

• `Private` **bulletinBoard**: `any`

#### Defined in

[av_client.ts:27](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L27)

___

### electionConfig

• `Private` **electionConfig**: `any`

#### Defined in

[av_client.ts:28](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L28)

___

### emptyCryptograms

• `Private` **emptyCryptograms**: `any`

#### Defined in

[av_client.ts:29](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L29)

___

### keyPair

• `Private` **keyPair**: `KeyPair`

#### Defined in

[av_client.ts:30](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L30)

___

### voteEncryptions

• `Private` **voteEncryptions**: `any`

#### Defined in

[av_client.ts:31](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L31)

___

### voteReceipt

• `Private` **voteReceipt**: `any`

#### Defined in

[av_client.ts:32](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L32)

___

### voterIdentifier

• `Private` **voterIdentifier**: `string`

#### Defined in

[av_client.ts:33](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L33)

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

[av_client.ts:47](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L47)

___

### contestIds

▸ `Private` **contestIds**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:253](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L253)

___

### cryptogramsForConfirmation

▸ **cryptogramsForConfirmation**(): `Object`

Returns data for rendering the list of cryptograms of the ballot

#### Returns

`Object`

Object containing a cryptogram for each contest

#### Defined in

[av_client.ts:169](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L169)

___

### electionEncryptionKey

▸ `Private` **electionEncryptionKey**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:257](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L257)

___

### electionId

▸ `Private` **electionId**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:249](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L249)

___

### electionSigningPublicKey

▸ `Private` **electionSigningPublicKey**(): `any`

#### Returns

`any`

#### Defined in

[av_client.ts:261](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L261)

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

[av_client.ts:152](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L152)

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

[av_client.ts:90](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L90)

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

[av_client.ts:124](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L124)

___

### getBallotList

▸ **getBallotList**(): `any`[]

Returns data for rendering a list of ballots

#### Returns

`any`[]

Array of ballot information objects

#### Defined in

[av_client.ts:117](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L117)

___

### getNumberOfOTPs

▸ **getNumberOfOTPs**(): `Promise`<`number`\>

Returns number of OTPs (one time passwords), voter should enter to authorize.
Number comes from election config on the bulletin board.

#### Returns

`Promise`<`number`\>

Promise<Number>

#### Defined in

[av_client.ts:79](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L79)

___

### hasAuthorizedPublicKey

▸ `Private` **hasAuthorizedPublicKey**(): `boolean`

#### Returns

`boolean`

#### Defined in

[av_client.ts:269](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L269)

___

### initiateDigitalReturn

▸ **initiateDigitalReturn**(`personalIdentificationInformation`): `Promise`<`boolean`\>

Takes PII, checks if an authorized public key already exists, and if so, returns true.
If not, sends it to Voter Authorization Coordinator Service, for it
to initiate Voter Authorizers to send out OTPs to the voter.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `personalIdentificationInformation` | `string` | We don't know what this will be yet. |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[av_client.ts:65](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L65)

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

[av_client.ts:233](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L233)

___

### privateKey

▸ `Private` **privateKey**(): `string`

#### Returns

`string`

#### Defined in

[av_client.ts:265](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L265)

___

### publicKey

▸ `Private` **publicKey**(): `string`

#### Returns

`string`

#### Defined in

[av_client.ts:276](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L276)

___

### requestOTPs

▸ `Private` **requestOTPs**(`personalIdentificationInformation`): `Promise`<`boolean`\>

Takes PII, sends it to Voter Authorization Coordinator Service, for it
to initiate Voter Authorizers to send out OTPs to the voter.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `personalIdentificationInformation` | `string` | We don't know what this will be yet. |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[av_client.ts:220](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L220)

___

### signAndSubmitEncryptedVotes

▸ **signAndSubmitEncryptedVotes**(): `Promise`<`Object`\>

Prepares the vote submission package.
Submits encrypted voter ballot choices to backend server.

#### Returns

`Promise`<`Object`\>

Returns the vote receipt as a promise.

#### Defined in

[av_client.ts:184](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L184)

___

### startBenalohChallenge

▸ **startBenalohChallenge**(): `Promise`<`any`\>

#### Returns

`Promise`<`any`\>

#### Defined in

[av_client.ts:161](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L161)

___

### submissionReceipt

▸ **submissionReceipt**(): `Object`

#### Returns

`Object`

#### Defined in

[av_client.ts:202](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L202)

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

[av_client.ts:143](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L143)

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

[av_client.ts:134](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L134)

___

### updateElectionConfig

▸ `Private` **updateElectionConfig**(): `Promise`<`void`\>

Attempts to populate election configuration data from backend server, if it hasn't been populated yet.

#### Returns

`Promise`<`void`\>

#### Defined in

[av_client.ts:209](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L209)
