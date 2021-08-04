[@aion-dk/js-client](README.md) / Exports

# @aion-dk/js-client

## Table of contents

### Classes

- [AVClient](classes/avclient.md)

### Interfaces

- [ContestIndexed](interfaces/contestindexed.md)

### Type aliases

- [CastVoteRecord](modules.md#castvoterecord)
- [Receipt](modules.md#receipt)

## Type aliases

### CastVoteRecord

Ƭ **CastVoteRecord**: [`ContestIndexed`](interfaces/contestindexed.md)<`string`\>

Example of a cvr:
```javascript
{
   '1': 'option1',
   '2': 'optiona'
}
```

___

### Receipt

Ƭ **Receipt**: `Object`

Example of a receipt:
```javascript
{
   previousBoardHash: 'd8d9742271592d1b212bbd4cbbbe357aef8e00cdbdf312df95e9cf9a1a921465',
   boardHash: '5a9175c2b3617298d78be7d0244a68f34bc8b2a37061bb4d3fdf97edc1424098',
   registeredAt: '2020-03-01T10:00:00.000+01:00',
   serverSignature: 'dbcce518142b8740a5c911f727f3c02829211a8ddfccabeb89297877e4198bc1,46826ddfccaac9ca105e39c8a2d015098479624c411b4783ca1a3600daf4e8fa',
   voteSubmissionId: 6
}
```

#### Type declaration

| Name | Type |
| :------ | :------ |
| `boardHash` | `string` |
| `previousBoardHash` | `string` |
| `registeredAt` | `string` |
| `serverSignature` | `string` |
| `voteSubmissionId` | `number` |
