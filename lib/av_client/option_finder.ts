import { flattenOptions } from './flatten_options';
import { InvalidOptionError } from './errors';
import { Option } from './types'

export function makeOptionFinder( options: Option[] ){
  const flatOptions = flattenOptions(options)
  const optionMap = extractOptionMap(flatOptions)
  
  return ( reference: string ): Option => {
    const option = optionMap[reference]
    if( option ) return option

    throw new InvalidOptionError('Option could not be found')
  }
}

function extractOptionMap(flatOptions: Option[]){
  return Object.fromEntries(flatOptions.map(option => [option.reference, option]))
}
