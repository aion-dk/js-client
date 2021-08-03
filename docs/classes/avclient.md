[@aion-dk/js-client](../README.md) / [Exports](../modules.md) / AVClient

# Class: AVClient

Assembly Voting Client API.

Expected sequence of methods being executed:
* [authenticateWithCodes](avclient.md#authenticatewithcodes)
* {@link AVClient.getBallotList | getBallotList }
* {@link AVClient.getBallot | getBallot }
* {@link AVClient.submitBallotChoices | submitBallotChoices }
* {@link AVClient.submitAttestation | submitAttestation }
* [encryptCVR](avclient.md#encryptcvr)
* [cryptogramsForConfirmation](avclient.md#cryptogramsforconfirmation)
* {@link AVClient.submissionReceipt | submissionReceipt }

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
- [getNumberOfOTPs](avclient.md#getnumberofotps)
- [hasAuthorizedPublicKey](avclient.md#hasauthorizedpublickey)
- [initiateDigitalReturn](avclient.md#initiatedigitalreturn)
- [privateKey](avclient.md#privatekey)
- [publicKey](avclient.md#publickey)
- [requestOTPs](avclient.md#requestotps)
- [signAndSubmitEncryptedVotes](avclient.md#signandsubmitencryptedvotes)
- [startBenalohChallenge](avclient.md#startbenalohchallenge)
- [updateElectionConfig](avclient.md#updateelectionconfig)

## Constructors

### constructor

• **new AVClient**(`bulletinBoardURL`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bulletinBoardURL` | `string` | URL to the Assembly Voting backend server, specific for election. |

#### Defined in

[av_client.ts:33](https://github.com/aion-dk/js-client/blob/e31b4bd/lib/av_client.ts#L33)

## Properties

### authorizationTokens

• `Private` **authorizationTokens**: `any`[]

#### Defined in

[av_client.ts:27](https://github.com/aion-dk/js-client/blob/e31b4bd/lib/av_client.ts#L27)

___

### bulletinBoard

• `Private` **bulletinBoard**: `any`

#### Defined in

[av_client.ts:28](https://github.com/aion-dk/js-client/blob/e31b4bd/lib/av_client.ts#L28)

___

### electionConfig

• `Private` **electionConfig**: `any`

#### Defined in

[av_client.ts:29](https://github.com/aion-dk/js-client/blob/e31b4bd/lib/av_client.ts#L29)

___

### emptyCryptograms

• `Private` **emptyCryptograms**: `ContestIndexed`<`EmptyCryptogram`\>

#### Defined in

[av_client.ts:30](https://github.com/aion-dk/js-client/blob/e31b4bd/lib/av_client.ts#L30)

___

### keyPair

• `Private` **keyPair**: `KeyPair`

#### Defined in

[av_client.ts:31](https://github.com/aion-dk/js-client/blob/e31b4bd/lib/av_client.ts#L31)

___

### voteEncryptions

• `Private` **voteEncryptions**: `ContestIndexed`<`Encryption`\>

#### Defined in

[av_client.ts:32](https://github.com/aion-dk/js-client/blob/e31b4bd/lib/av_client.ts#L32)

___

### voterIdentifier

• `Private` **voterIdentifier**: `string`

#### Defined in

[av_client.ts:33](https://github.com/aion-dk/js-client/blob/e31b4bd/lib/av_client.ts#L33)

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

[av_client.ts:47](https://github.com/aion-dk/js-client/blob/e31b4bd/lib/av_client.ts#L47)

___

### contestIds

▸ `Private` **contestIds**(): `string`[]

#### Returns

`string`[]

#### Defined in

[av_client.ts:227](https://github.com/aion-dk/js-client/blob/e31b4bd/lib/av_client.ts#L227)

___

### cryptogramsForConfirmation

▸ `Private` **cryptogramsForConfirmation**(): `ContestIndexed`<`string`\>

Returns data for rendering the list of cryptograms of the ballot

#### Returns

`ContestIndexed`<`string`\>

Object containing a cryptogram for each contest

#### Defined in

[av_client.ts:190](https://github.com/aion-dk/js-client/blob/e31b4bd/lib/av_client.ts#L190)

___

### electionEncryptionKey

▸ `Private` **electionEncryptionKey**(): `string`

#### Returns

`string`

#### Defined in

[av_client.ts:231](https://github.com/aion-dk/js-client/blob/e31b4bd/lib/av_client.ts#L231)

___

### electionId

▸ `Private` **electionId**(): `number`

#### Returns

`number`

#### Defined in

[av_client.ts:223](https://github.com/aion-dk/js-client/blob/e31b4bd/lib/av_client.ts#L223)

___

### electionSigningPublicKey

▸ `Private` **electionSigningPublicKey**(): `string`

#### Returns

`string`

#### Defined in

[av_client.ts:235](https://github.com/aion-dk/js-client/blob/e31b4bd/lib/av_client.ts#L235)

___

### encryptCVR

▸ **encryptCVR**(`cvr`): `Promise`<`string`\>

Encrypts a CVR and generates vote cryptograms.
CVR format is expected to be an object with `contestId` as keys and `option_handle` as values.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cvr` | `ContestIndexed`<`string`\> | Object containing the selections for each contest |

#### Returns

`Promise`<`string`\>

the cryptograms fingerprint

#### Defined in

[av_client.ts:124](https://github.com/aion-dk/js-client/blob/e31b4bd/lib/av_client.ts#L124)

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

[av_client.ts:90](https://github.com/aion-dk/js-client/blob/e31b4bd/lib/av_client.ts#L90)

___

### getNumberOfOTPs

▸ **getNumberOfOTPs**(): `Promise`<`number`\>

Returns number of OTPs (one time passwords), voter should enter to authorize.
Number comes from election config on the bulletin board.

#### Returns

`Promise`<`number`\>

Promise<Number>

#### Defined in

[av_client.ts:79](https://github.com/aion-dk/js-client/blob/e31b4bd/lib/av_client.ts#L79)

___

### hasAuthorizedPublicKey

▸ `Private` **hasAuthorizedPublicKey**(): `Promise`<`boolean`\>

#### Returns

`Promise`<`boolean`\>

#### Defined in

[av_client.ts:247](https://github.com/aion-dk/js-client/blob/e31b4bd/lib/av_client.ts#L247)

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

[av_client.ts:65](https://github.com/aion-dk/js-client/blob/e31b4bd/lib/av_client.ts#L65)

___

### privateKey

▸ `Private` **privateKey**(): `string`

#### Returns

`string`

#### Defined in

[av_client.ts:239](https://github.com/aion-dk/js-client/blob/e31b4bd/lib/av_client.ts#L239)

___

### publicKey

▸ `Private` **publicKey**(): `string`

#### Returns

`string`

#### Defined in

[av_client.ts:243](https://github.com/aion-dk/js-client/blob/e31b4bd/lib/av_client.ts#L243)

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

[av_client.ts:214](https://github.com/aion-dk/js-client/blob/e31b4bd/lib/av_client.ts#L214)

___

### signAndSubmitEncryptedVotes

▸ **signAndSubmitEncryptedVotes**(`affidavit`): `Promise`<`Receipt`\>

Prepares the vote submission package.
Submits encrypted voter ballot choices to backend server.

#### Parameters

| Name | Type |
| :------ | :------ |
| `affidavit` | `string` |

#### Returns

`Promise`<`Receipt`\>

Returns the vote receipt as a promise.

#### Defined in

[av_client.ts:168](https://github.com/aion-dk/js-client/blob/e31b4bd/lib/av_client.ts#L168)

___

### startBenalohChallenge

▸ **startBenalohChallenge**(): `Promise`<`ContestIndexed`<`string`\>\>

#### Returns

`Promise`<`ContestIndexed`<`string`\>\>

#### Defined in

[av_client.ts:159](https://github.com/aion-dk/js-client/blob/e31b4bd/lib/av_client.ts#L159)

___

### updateElectionConfig

▸ `Private` **updateElectionConfig**(): `Promise`<`void`\>

Attempts to populate election configuration data from backend server, if it hasn't been populated yet.

#### Returns

`Promise`<`void`\>

#### Defined in

[av_client.ts:203](https://github.com/aion-dk/js-client/blob/e31b4bd/lib/av_client.ts#L203)
