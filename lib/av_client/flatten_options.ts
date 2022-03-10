import { Option } from './types';

function flattenOption(option: Option){
  const clone = { ...option }
  delete clone.children

  const children = option.children || []
  return [clone].concat(flattenOptions(children))
}

export function flattenOptions(options: Option[]){
  const reducer = (list: Option[], option: Option) => list.concat(flattenOption(option))
  return options.reduce(reducer, [])
}
