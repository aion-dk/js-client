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

[av_client.ts:200](https://github.com/aion-dk/js-client/blob/3f3e4cc/lib/av_client.ts#L200)

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

[av_client.ts:202](https://github.com/aion-dk/js-client/blob/3f3e4cc/lib/av_client.ts#L202)
