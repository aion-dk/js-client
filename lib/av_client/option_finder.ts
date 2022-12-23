import { flattenOptions } from './flatten_options';
import { InvalidOptionError } from './errors';
import { OptionContent } from './types'

export function makeOptionFinder( options: OptionContent[] ){
  const flatOptions = flattenOptions(options)
  const optionMap = extractOptionMap(flatOptions)
  
  return ( reference: string ): OptionContent => {
    const option = optionMap[reference]
    if( option ) return option

    throw new InvalidOptionError('Option could not be found')
  }
}

function extractOptionMap(flatOptions: OptionContent[]){
  return Object.fromEntries(flatOptions.map(option => [option.reference, option]))
}
