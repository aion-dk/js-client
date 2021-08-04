[@aion-dk/js-client](../README.md) / [Exports](../modules.md) / ContestIndexed

# Interface: ContestIndexed<T\>

This is an index, with contest ids for keys, and arbitrary values that belong to matching contests.

Example, with selected contest options:
```javascript
{ '1': 'option1', '2': 'optiona' }
```

Here `'1'` and `'2'` are contest ids, and `'option1'` and `'optiona'` are selected contest options.

## Type parameters

| Name | Description |
| :------ | :------ |
| `T` | Defines the data type of the value |

## Indexable

▪ [contestId: `string`]: `T`
