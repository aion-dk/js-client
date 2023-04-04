import {ContestConfig, ContestSelection, OptionSelection, OptionContent, SelectionPile} from "../types"
import { flattenOptions } from '../flatten_options'
import { ByteArrayReader } from './byte_array_reader'
import { ByteArrayWriter } from "./byte_array_writer"


export function byteArrayToSelectionPile(contestConfig: ContestConfig, byteArray: Uint8Array , multiplier: number): SelectionPile {
  const { markingType, options } = contestConfig.content
  const codeSize = markingType.encoding.codeSize

  const flatOptions = flattenOptions(options)
  const referenceMap = extractReferenceMap(flatOptions)
  const writeInMap = extractWriteInMap(flatOptions)

  const optionSelections: OptionSelection[] = []

  const reader = new ByteArrayReader(byteArray)

  while( reader.hasMore() ){
    const code = reader.readInteger(codeSize)
    if( code === 0 ) throw new Error('ArgumentError: Unexpected bytes found in byte array')

    const reference = referenceMap[code]
    if( !reference ) throw new Error('ArgumentError: Unexpected option code encountered')
    // Is the selected option a write in?
    const writeIn = writeInMap[reference]
    if( writeIn ){
      const text = reader.readString(writeIn.maxSize)
      optionSelections.push({ reference, text: text })
    } else {
      optionSelections.push({ reference })
    }
  }

  return {
    multiplier,
    optionSelections: optionSelections
  }
}


export function contestSelectionToByteArray( contestConfig: ContestConfig, selectionPile: SelectionPile ): Uint8Array {
  const { markingType, options } = contestConfig.content

  const flatOptions = flattenOptions(options)
  const codeMap = extractCodeMap(flatOptions)
  const writeInMap = extractWriteInMap(flatOptions)

  const writer = new ByteArrayWriter(markingType.encoding.maxSize)

  selectionPile.optionSelections.forEach(optionSelection => {
    const writeIn = writeInMap[optionSelection.reference]
    const code = codeMap[optionSelection.reference]

    if( ! code ) throw new Error("Option reference not found")
    if( writeIn && writeIn.encoding !== 'utf8' ) throw new Error(`Unsupported encoding '${writeIn.encoding}' for write in`)

    writer.writeInteger(markingType.encoding.codeSize, code)

    if( writeIn ){
      const text = optionSelection.text || ''
      writer.writeString(writeIn.maxSize, text)
    }
  })

  return writer.getByteArray()
}


function extractWriteInMap(flatOptions: OptionContent[]){
  const writeInOptions = flatOptions.filter(option => option.writeIn)
  return Object.fromEntries(writeInOptions.map(option => [option.reference, option.writeIn]))
}

function extractCodeMap(flatOptions: OptionContent[]){
  return Object.fromEntries(flatOptions.map(option => [option.reference, option.code]))
}

function extractReferenceMap(flatOptions: OptionContent[]){
  return Object.fromEntries(flatOptions.map(option => [option.code, option.reference]))
}
