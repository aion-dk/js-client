import { OptionContent } from './types';

function flattenOption(option: OptionContent){
  const clone = { ...option }
  delete clone.children

  const children = option.children || []
  return [clone].concat(flattenOptions(children))
}

export function flattenOptions(options: OptionContent[]): OptionContent[] {
  const reducer = (list: OptionContent[], option: OptionContent) => list.concat(flattenOption(option))
  return options.reduce(reducer, [])
}
