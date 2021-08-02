[@aion-dk/js-client](../README.md) / [Exports](../modules.md) / Storage

# Interface: Storage

Setter/getter for persistence layer of the application

## Table of contents

### Properties

- [get](storage.md#get)
- [set](storage.md#set)

## Properties

### get

• **get**: (`key`: `string`) => `any`

#### Type declaration

▸ (`key`): `any`

Returns value that is persisted at `key`.

##### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

##### Returns

`any`

#### Defined in

[av_client.ts:286](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L286)

___

### set

• **set**: (`key`: `string`, `value`: `any`) => `any`

#### Type declaration

▸ (`key`, `value`): `any`

Persists `value` at `key`.

##### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |
| `value` | `any` |

##### Returns

`any`

#### Defined in

[av_client.ts:288](https://github.com/aion-dk/js-client/blob/a66be87/lib/av_client.ts#L288)
